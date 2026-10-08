-- RideLink Techs — dedicated contact capture.
-- Project: qyqhoegexqmzdzrosztm ("vibeholic-media", shared with VibeHolic). PG 17.6.
--
-- It touches ONLY the objects named below: no FK, no policy, and no reference to
-- any VibeHolic table. VibeHolic's admin reads its own contact_lead via
-- rpc/list_admin_leads and rpc/get_admin_dashboard_stats, so a shared table would
-- leak these briefs into another product's dashboard.
-- Applied through the Supabase MCP on 2026-10-08. Pre-flight on that database:
-- service_role carries BYPASSRLS, no object named ridelink_* existed, and
-- public.contact_lead belongs to VibeHolic and is untouched.

create table if not exists public.ridelink_contact_message (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  email        text        not null,
  message      text        not null,
  phone        text,
  locale       text        not null default 'vi',
  status       text        not null default 'new',
  source_url   text,
  from_source  text,
  ip_hash      text,
  admin_note   text,
  submitted_at timestamptz not null default now(),

  constraint ridelink_contact_message_name_ck
    check (char_length(btrim(name)) between 1 and 120),

  constraint ridelink_contact_message_email_ck
    check (char_length(email) between 3 and 254
       and email ~ '^[^@[:space:]<>]+@[^@[:space:]]+\.[^@[:space:]<>]+$'),

  constraint ridelink_contact_message_message_ck
    check (char_length(btrim(message)) between 1 and 5000),

  constraint ridelink_contact_message_locale_ck
    check (locale in ('vi', 'en')),

  constraint ridelink_contact_message_status_ck
    check (status in ('new', 'processing', 'handled', 'rejected', 'spam')),

  constraint ridelink_contact_message_source_url_ck
    check (source_url is null or char_length(source_url) between 1 and 2048),

  -- Optional: NULL means "left blank". A bare '' would fail this, so
  -- actions.ts coerces empty to NULL before the insert.
  --
  -- Stored NORMALISED, not as typed. A human types "0912 345 678",
  -- "+84 912 345 678" or "0912.345.678"; all of them land here as digits and
  -- an optional leading +, which is the only form a lead list can actually
  -- dial. The regex matches actions.ts exactly, so a value that reaches
  -- Postgres has already passed the same test the server applied.
  constraint ridelink_contact_message_phone_ck
    check (phone is null or phone ~ '^\+?[0-9]{6,20}$'),

  -- Optional free text: where the visitor heard about us.
  --
  -- Deliberately not an enum. The wording of the answer lives in the i18n
  -- files, and a CHECK list here would freeze one translation into the schema
  -- the first time a label is reworded. This only stops a tampered POST from
  -- parking an unbounded string in the owner's inbox.
  constraint ridelink_contact_message_from_source_ck
    check (from_source is null or char_length(from_source) between 1 and 80),

  -- Nullable on purpose. A local Docker run has no proxy header, so there is no
  -- IP to hash; a sentinel value would collapse every such visitor into one
  -- shared rate-limit bucket.
  constraint ridelink_contact_message_ip_hash_ck
    check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$')
);

comment on table public.ridelink_contact_message is
  'RideLink Techs contact briefs, dedicated to ridelinktechs.com. Do NOT merge with or write into contact_lead: VibeHolic reads that table through rpc/list_admin_leads and rpc/get_admin_dashboard_stats. Written ONLY through ridelink_contact_submit; no role holds a direct grant on this table and there are no RLS policies.';

-- Backs the rate-limit count inside ridelink_contact_submit.
create index if not exists ridelink_contact_message_ip_hash_submitted_at_idx
  on public.ridelink_contact_message (ip_hash, submitted_at desc);

-- The only read the human runs: new leads, newest first.
create index if not exists ridelink_contact_message_status_submitted_at_idx
  on public.ridelink_contact_message (status, submitted_at desc);

alter table public.ridelink_contact_message enable row level security;

revoke all on table public.ridelink_contact_message from anon, authenticated;

-- The write path. One function, not table INSERT.
--
-- Why an RPC at all: service_role carries BYPASSRLS, so a key that can INSERT
-- into this table can also read and write every OTHER table in the project —
-- including VibeHolic's admin_user, admin_device and contact_lead. This project
-- is shared. Handing out a key whose table privilege is scoped to one function
-- means a leak costs the attacker one blind write endpoint and nothing else.
--
-- security definer is what makes that work: the function runs as its owner
-- (the migration role), which bypasses the deny-all RLS above, so the table
-- grant can be revoked from service_role entirely.
create or replace function public.ridelink_contact_submit(
  p_name        text,
  p_email       text,
  p_message     text,
  p_phone       text,
  p_from_source text,
  p_source_url  text,
  p_locale      text,
  p_ip_hash     text,
  p_rate_limit  integer,
  p_window_secs integer
) returns jsonb
language plpgsql
security definer
-- Empty, not "public". A search_path lets a caller plant an object that
-- shadows something this body resolves unqualified, which in a SECURITY
-- DEFINER function is code execution as the owner. The table is schema-
-- qualified for exactly that reason; now(), count(*), make_interval() and the
-- jsonb builders resolve through pg_catalog, which stays implicitly first
-- even when this is empty.
set search_path = ''
as $$
declare
  v_recent integer;
begin
  -- The DB-side limiter. The in-memory one in actions.ts covers a single Node
  -- process; this one survives a restart and still holds with more than one
  -- replica behind the load balancer.
  --
  -- No advisory lock here on purpose: two concurrent submits from one IP can
  -- both pass this count and both insert, so the true ceiling is
  -- p_rate_limit + (number of concurrent submits). That is the correct trade
  -- for a contact form — a lock would serialise every write in the table to
  -- defend against a visitor double-tapping Send, which the form's own
  -- disable-on-submit already prevents.
  if p_ip_hash is not null then
    select count(*) into v_recent
    from public.ridelink_contact_message
    where ip_hash = p_ip_hash
      and submitted_at > now() - make_interval(secs => p_window_secs);

    if v_recent >= p_rate_limit then
      return jsonb_build_object('ok', false, 'code', 'rate');
    end if;
  end if;

  -- Validation is NOT duplicated here. actions.ts already rejects a bad value
  -- before spending a round trip, and needs the field name to highlight the
  -- right input. The CHECK constraints are the actual backstop for a tampered
  -- POST — they reject the row whatever the caller sent.
  insert into public.ridelink_contact_message
    (name, email, message, phone, from_source, source_url, locale, ip_hash)
  values
    (p_name, p_email, p_message, p_phone, p_from_source, p_source_url, p_locale, p_ip_hash);

  return jsonb_build_object('ok', true, 'code', null);
end;
$$;

-- Functions default to EXECUTE for PUBLIC, which would hand anon a path that
-- skips Turnstile, the honeypot and the rate limit entirely. Revoke from public
-- FIRST, then grant to exactly one role.
revoke all on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer
) from public;

-- The revoke above is NOT enough on this project, and this is the single most
-- important line pair in the file.
--
-- The project carries ALTER DEFAULT PRIVILEGES granting EXECUTE on every new
-- function in schema public to anon and authenticated:
--
--   pg_default_acl: {defaclobjtype='f', defaclrole='postgres',
--                    acl={postgres=X, anon=X, authenticated=X, service_role=X}}
--
-- So the function is born with anon=X regardless of the PUBLIC default, and a
-- revoke-from-public alone leaves the bot gate callable from a browser with the
-- public anon key. Verified: the guard at the bottom of this file caught exactly
-- this on first run.
--
-- Revoking from anon/authenticated by name is the only thing that holds. Do not
-- "simplify" this back to revoke-from-public only.
revoke execute on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer
) from anon;

revoke execute on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer
) from authenticated;

grant execute on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer
) to service_role;

-- service_role keeps EXECUTE but loses the table. The function runs as its
-- owner, so this breaks nothing and is the whole point of the RPC.
revoke all on table public.ridelink_contact_message from service_role;

-- Deny-all RLS fails silently when it is wrong: a rejected insert returns 42501
-- or an empty array and every brief vanishes. Refuse to finish unless the exact
-- posture is in place.
do $$
declare
  v_count integer;
begin
  if not exists (
    select 1 from pg_roles where rolname = 'service_role' and rolbypassrls
  ) then
    raise exception 'ABORT: role service_role has no BYPASSRLS; the server action insert will be rejected. Grant BYPASSRLS to service_role, then re-run.';
  end if;

  select count(*) into v_count
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'ridelink_contact_message'
    and not c.relrowsecurity;
  if v_count > 0 then
    raise exception 'ABORT: RLS is not enabled on public.ridelink_contact_message.';
  end if;

  select count(*) into v_count
  from pg_policies
  where schemaname = 'public' and tablename = 'ridelink_contact_message';
  if v_count > 0 then
    raise exception 'ABORT: % RLS policy(ies) still exist on ridelink_contact_message. This design is deny-all; drop them.', v_count;
  end if;

  select count(*) into v_count
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name = 'ridelink_contact_message'
    and grantee in ('anon', 'authenticated');
  if v_count > 0 then
    raise exception 'ABORT: anon/authenticated still hold % grant(s) on ridelink_contact_message.', v_count;
  end if;

  -- The revoke above is the load-bearing one, and it is also the easiest to
  -- undo by accident: a later `grant all to service_role` on this table would
  -- silently hand the key write access to all 23 tables again, because
  -- BYPASSRLS is a property of the ROLE, not of the table. Fail loudly instead.
  if exists (
    select 1 from pg_roles
    where rolname = 'service_role'
      and has_table_privilege('service_role', 'public.ridelink_contact_message', 'INSERT')
  ) then
    raise exception 'ABORT: service_role still holds INSERT on ridelink_contact_message. The key must reach the table only through ridelink_contact_submit.';
  end if;

  -- Postgres grants EXECUTE on a new function to PUBLIC by default. If that
  -- stands, an anonymous key can call ridelink_contact_submit straight from a
  -- browser and skip Turnstile, the honeypot and the rate limit — the exact
  -- write path this design exists to prevent. anon inherits PUBLIC.
  if has_function_privilege('anon', 'public.ridelink_contact_submit(text,text,text,text,text,text,text,text,integer,integer)', 'EXECUTE') then
    raise exception 'ABORT: anon can EXECUTE ridelink_contact_submit. The `revoke ... from public` is missing, so the bot gate is bypassable from a browser.';
  end if;

  if not has_function_privilege('service_role', 'public.ridelink_contact_submit(text,text,text,text,text,text,text,text,integer,integer)', 'EXECUTE') then
    raise exception 'ABORT: service_role cannot EXECUTE ridelink_contact_submit; the server action insert will fail.';
  end if;

  -- create table if not exists silently skips constraints on a pre-existing
  -- table, which would leave an unconstrained public write target behind.
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.ridelink_contact_message'::regclass
      and conname = 'ridelink_contact_message_status_ck'
  ) then
    raise exception 'ABORT: public.ridelink_contact_message already existed without its CHECK constraints. Drop that table and re-run this migration.';
  end if;

  -- Same trap, for the columns. If an older revision of this migration ran,
  -- `create table if not exists` skipped the whole definition: the table looks
  -- fine, the guard above passes because status_ck happens to be on it, and
  -- then every submit 400s on PGRST204 for a column that does not exist.
  if exists (
    select 1
    from (values ('phone'), ('from_source')) as want(name)
    where not exists (
      select 1
      from pg_attribute a
      where a.attrelid = 'public.ridelink_contact_message'::regclass
        and a.attname = want.name
        and a.attnum > 0
        and not a.attisdropped
    )
  ) then
    raise exception 'ABORT: public.ridelink_contact_message is missing the phone / from_source column(s). It was created by an older revision of this migration. Drop that table and re-run.';
  end if;
end $$;