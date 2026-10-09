alter table public.ridelink_contact_message
  add column if not exists inquiry_type text,
  add column if not exists project      text;
alter table public.ridelink_contact_message
  drop constraint if exists ridelink_contact_message_inquiry_type_ck,
  drop constraint if exists ridelink_contact_message_project_ck,
  add constraint ridelink_contact_message_inquiry_type_ck
    check (inquiry_type is null or inquiry_type in ('invest', 'build', 'other')),
  add constraint ridelink_contact_message_project_ck
    check (project is null or char_length(project) between 1 and 120);
comment on column public.ridelink_contact_message.inquiry_type is
  'invest: the visitor wants to invest in or partner on one of our products. build: the visitor wants us to build a product for them. other: anything else we can help with. NULL on rows written before this column existed.';
comment on column public.ridelink_contact_message.project is
  'Name of one of our own products, picked from the dropdown or carried over from a product page. NULL means all products or none in particular. Client projects are never stored here.';
drop function if exists public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer
);
create or replace function public.ridelink_contact_submit(
  p_name         text,
  p_email        text,
  p_message      text,
  p_phone        text,
  p_from_source  text,
  p_source_url   text,
  p_locale       text,
  p_ip_hash      text,
  p_rate_limit   integer,
  p_window_secs  integer,
  p_inquiry_type text default null,
  p_project      text default null
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
    (name, email, message, phone, from_source, source_url, locale, ip_hash, inquiry_type, project)
  values
    (p_name, p_email, p_message, p_phone, p_from_source, p_source_url, p_locale, p_ip_hash, p_inquiry_type, p_project);
  return jsonb_build_object('ok', true, 'code', null);
end;
$$;
revoke all on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer, text, text
) from public;
revoke execute on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer, text, text
) from anon;
revoke execute on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer, text, text
) from authenticated;
grant execute on function public.ridelink_contact_submit(
  text, text, text, text, text, text, text, text, integer, integer, text, text
) to service_role;
notify pgrst, 'reload schema';
do $$
begin
  if to_regprocedure('public.ridelink_contact_submit(text,text,text,text,text,text,text,text,integer,integer)') is not null then
    raise exception 'ABORT: the 10-argument ridelink_contact_submit still exists next to the 12-argument one. PostgREST cannot choose between them, so every submit would fail with PGRST203.';
  end if;
  if has_function_privilege('anon', 'public.ridelink_contact_submit(text,text,text,text,text,text,text,text,integer,integer,text,text)', 'EXECUTE') then
    raise exception 'ABORT: anon can EXECUTE ridelink_contact_submit. The database default privileges grant it to new functions, so the revoke by role name is what closes it.';
  end if;
  if has_function_privilege('authenticated', 'public.ridelink_contact_submit(text,text,text,text,text,text,text,text,integer,integer,text,text)', 'EXECUTE') then
    raise exception 'ABORT: authenticated can EXECUTE ridelink_contact_submit. The bot gate is bypassable from a signed-in browser.';
  end if;
  if not has_function_privilege('service_role', 'public.ridelink_contact_submit(text,text,text,text,text,text,text,text,integer,integer,text,text)', 'EXECUTE') then
    raise exception 'ABORT: service_role cannot EXECUTE ridelink_contact_submit; the server action insert will fail.';
  end if;
  if exists (
    select 1
    from (values ('inquiry_type'), ('project')) as want(name)
    where not exists (
      select 1
      from pg_attribute a
      where a.attrelid = 'public.ridelink_contact_message'::regclass
        and a.attname = want.name
        and a.attnum > 0
        and not a.attisdropped
    )
  ) then
    raise exception 'ABORT: public.ridelink_contact_message is missing the inquiry_type / project column(s).';
  end if;
  if (
    select count(*)
    from pg_constraint
    where conrelid = 'public.ridelink_contact_message'::regclass
      and conname in ('ridelink_contact_message_inquiry_type_ck', 'ridelink_contact_message_project_ck')
  ) <> 2 then
    raise exception 'ABORT: the inquiry_type / project CHECK constraints are missing.';
  end if;
end $$;
