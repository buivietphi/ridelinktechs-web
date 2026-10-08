-- RideLink Techs — dedicated contact capture.
-- Project: qyqhoegexqmzdzrosztm (shared with VibeHolic). PG 14.5.
--
-- Run ONCE in the Supabase SQL Editor. It touches ONLY the objects named below:
-- no FK, no policy, and no reference to any VibeHolic table. VibeHolic's admin
-- reads its own contact_lead via rpc/list_admin_leads and rpc/get_admin_dashboard_stats,
-- so a shared table would leak these briefs into another product's dashboard.
-- Verified live before writing: this table did not exist (PostgREST returned
-- PGRST205, hint public.contact_lead), and no object in the project is ridelink_*.

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
  'RideLink Techs contact briefs, dedicated to ridelinktechs.com. Do NOT merge with or write into contact_lead: VibeHolic reads that table through rpc/list_admin_leads and rpc/get_admin_dashboard_stats. Written by a server action with service_role only; anon and authenticated hold no grant and there are no RLS policies.';

-- The only write-side query the server action runs: count this IP's recent leads.
create index if not exists ridelink_contact_message_ip_hash_submitted_at_idx
  on public.ridelink_contact_message (ip_hash, submitted_at desc);

-- The only read the human runs: new leads, newest first.
create index if not exists ridelink_contact_message_status_submitted_at_idx
  on public.ridelink_contact_message (status, submitted_at desc);

-- Deny-all RLS. Turnstile verification needs the server-only secret, so the
-- browser can never legitimately write: an anon INSERT policy would grant an
-- attacker a path straight to PostgREST that skips the bot gate, the honeypot,
-- validation and rate limiting.
alter table public.ridelink_contact_message enable row level security;

drop policy if exists ridelink_contact_message_insert_anon
  on public.ridelink_contact_message;

revoke all on table public.ridelink_contact_message from anon, authenticated;
grant all on table public.ridelink_contact_message to service_role;

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