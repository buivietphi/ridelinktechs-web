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
  constraint ridelink_contact_message_phone_ck
    check (phone is null or phone ~ '^\+?[0-9]{6,20}$'),
  constraint ridelink_contact_message_from_source_ck
    check (from_source is null or char_length(from_source) between 1 and 80),
  constraint ridelink_contact_message_ip_hash_ck
    check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$')
);
comment on table public.ridelink_contact_message is
  'RideLink Techs contact briefs, dedicated to ridelinktechs.com. Do NOT merge with or write into contact_lead: VibeHolic reads that table through rpc/list_admin_leads and rpc/get_admin_dashboard_stats. Written ONLY through ridelink_contact_submit; no role holds a direct grant on this table and there are no RLS policies.';
create index if not exists ridelink_contact_message_ip_hash_submitted_at_idx
  on public.ridelink_contact_message (ip_hash, submitted_at desc);
create index if not exists ridelink_contact_message_status_submitted_at_idx
  on public.ridelink_contact_message (status, submitted_at desc);
alter table public.ridelink_contact_message enable row level security;
revoke all on table public.ridelink_contact_message from anon, authenticated;
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
set search_path = ''
as $$
declare
  v_recent integer;
begin
  if p_ip_hash is not null then
    select count(*) into v_recent
    from public.ridelink_contact_message
    where ip_hash = p_ip_hash
      and submitted_at > now() - make_interval(secs => p_window_secs);
    if v_recent >= p_rate_limit then
      return jsonb_build_object('ok', false, 'code', 'rate');
    end if;
  end if;
  insert into public.ridelink_contact_message
    (name, email, message, phone, from_source, source_url, locale, ip_hash)
  values
    (p_name, p_email, p_message, p_phone, p_from_source, p_source_url, p_locale, p_ip_hash);
  return jsonb_build_object('ok', true, 'code', null);
end;
$$;
revoke all on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer
) from public;
revoke execute on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer
) from anon;
revoke execute on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer
) from authenticated;
grant execute on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer
) to service_role;
revoke all on table public.ridelink_contact_message from service_role;
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
  if exists (
    select 1 from pg_roles
    where rolname = 'service_role'
      and has_table_privilege('service_role', 'public.ridelink_contact_message', 'INSERT')
  ) then
    raise exception 'ABORT: service_role still holds INSERT on ridelink_contact_message. The key must reach the table only through ridelink_contact_submit.';
  end if;
  if has_function_privilege('anon', 'public.ridelink_contact_submit(text,text,text,text,text,text,text,text,integer,integer)', 'EXECUTE') then
    raise exception 'ABORT: anon can EXECUTE ridelink_contact_submit. The `revoke ... from public` is missing, so the bot gate is bypassable from a browser.';
  end if;
  if not has_function_privilege('service_role', 'public.ridelink_contact_submit(text,text,text,text,text,text,text,text,integer,integer)', 'EXECUTE') then
    raise exception 'ABORT: service_role cannot EXECUTE ridelink_contact_submit; the server action insert will fail.';
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.ridelink_contact_message'::regclass
      and conname = 'ridelink_contact_message_status_ck'
  ) then
    raise exception 'ABORT: public.ridelink_contact_message already existed without its CHECK constraints. Drop that table and re-run this migration.';
  end if;
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
