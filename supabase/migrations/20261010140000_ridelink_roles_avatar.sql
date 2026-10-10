alter table public.ridelink_user add column if not exists avatar text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ridelink_user_avatar_ck') then
    alter table public.ridelink_user add constraint ridelink_user_avatar_ck
      check (avatar is null
          or (char_length(avatar) <= 120000
              and avatar ~ '^data:image/(webp|jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$'));
  end if;
end $$;

comment on column public.ridelink_user.avatar is
  'Profile picture as a small data URL (webp, jpeg or png), set by the person from /admin/profile.';

alter table public.ridelink_contact_message
  add column if not exists status_by      uuid references public.ridelink_user (id) on delete set null,
  add column if not exists status_by_name text,
  add column if not exists status_at      timestamptz;

comment on column public.ridelink_contact_message.status_by is
  'The /admin account that last changed the status. status_by_name keeps its name if that account is deleted.';

create or replace function public.ridelink_can_manage(p_actor_role text, p_target_role text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case p_actor_role
    when 'admin' then p_target_role in ('admin', 'owner', 'sub')
    when 'owner' then p_target_role = 'sub'
    else false
  end;
$$;

create or replace function public.ridelink_auth_session(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.ridelink_session;
  v_user    public.ridelink_user;
  v_device  public.ridelink_device;
begin
  select * into v_session from public.ridelink_session where token_hash = p_token_hash;
  if v_session.id is null then
    return jsonb_build_object('ok', false, 'reason', 'ended');
  end if;
  if v_session.revoked_at is not null then
    return jsonb_build_object('ok', false, 'reason', v_session.revoked_reason);
  end if;
  if v_session.expires_at <= now() then
    return jsonb_build_object('ok', false, 'reason', 'expired');
  end if;

  select * into v_user from public.ridelink_user where id = v_session.user_id;
  if v_user.is_blocked then
    return jsonb_build_object('ok', false, 'reason', 'account_blocked');
  end if;
  select * into v_device from public.ridelink_device where id = v_session.device_id;
  if v_device.is_blocked then
    return jsonb_build_object('ok', false, 'reason', 'device_blocked');
  end if;

  if v_session.last_seen_at < now() - interval '1 minute' then
    update public.ridelink_session set last_seen_at = now() where id = v_session.id;
    update public.ridelink_device set last_seen_at = now() where id = v_session.device_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'user_id', v_user.id,
    'email', v_user.email,
    'display_name', v_user.display_name,
    'role', v_user.role,
    'avatar', v_user.avatar,
    'must_change_password', v_user.must_change_password,
    'device_id', v_session.device_id
  );
end;
$$;

create or replace function public.ridelink_auth_profile(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor  public.ridelink_user := public.ridelink_actor(p_token_hash, 'sub');
  v_device uuid;
begin
  select device_id into v_device from public.ridelink_session where token_hash = p_token_hash;
  return jsonb_build_object(
    'id', v_actor.id,
    'email', v_actor.email,
    'display_name', v_actor.display_name,
    'role', v_actor.role,
    'avatar', v_actor.avatar,
    'created_at', v_actor.created_at,
    'last_login_at', v_actor.last_login_at,
    'password_changed_at', v_actor.password_changed_at,
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', d.id,
        'device_name', d.device_name,
        'user_agent', d.user_agent,
        'first_seen_at', d.first_seen_at,
        'last_login_at', d.last_login_at,
        'last_seen_at', d.last_seen_at,
        'is_blocked', d.is_blocked,
        'session_count', (select count(*) from public.ridelink_session s
                          where s.device_id = d.id and s.revoked_at is null and s.expires_at > now()),
        'is_current', d.id = v_device
      ) order by d.last_seen_at desc)
      from public.ridelink_device d
      where d.user_id = v_actor.id
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.ridelink_auth_set_avatar(p_token_hash text, p_avatar text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'sub');
begin
  update public.ridelink_user
  set avatar = nullif(btrim(coalesce(p_avatar, '')), '')
  where id = v_actor.id;
  return jsonb_build_object('ok', true, 'code', null);
exception
  when check_violation then
    return jsonb_build_object('ok', false, 'code', 'invalid');
end;
$$;

create or replace function public.ridelink_admin_list_users(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor  public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_device uuid;
begin
  select device_id into v_device from public.ridelink_session where token_hash = p_token_hash;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'display_name', u.display_name,
      'role', u.role,
      'avatar', u.avatar,
      'is_blocked', u.is_blocked,
      'must_change_password', u.must_change_password,
      'created_at', u.created_at,
      'last_login_at', u.last_login_at,
      'password_changed_at', u.password_changed_at,
      'device_count', (select count(*) from public.ridelink_device d where d.user_id = u.id),
      'session_count', (select count(*) from public.ridelink_session s
                        where s.user_id = u.id and s.revoked_at is null and s.expires_at > now()),
      'is_self', u.id = v_actor.id,
      'can_manage', u.id <> v_actor.id and public.ridelink_can_manage(v_actor.role, u.role),
      'devices', case
        when u.id = v_actor.id or public.ridelink_can_manage(v_actor.role, u.role) then coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', d.id,
            'device_name', d.device_name,
            'user_agent', d.user_agent,
            'first_seen_at', d.first_seen_at,
            'last_login_at', d.last_login_at,
            'last_seen_at', d.last_seen_at,
            'is_blocked', d.is_blocked,
            'session_count', (select count(*) from public.ridelink_session s
                              where s.device_id = d.id and s.revoked_at is null and s.expires_at > now()),
            'is_current', d.id = v_device,
            'can_manage', public.ridelink_can_manage(v_actor.role, u.role)
          ) order by d.last_seen_at desc)
          from public.ridelink_device d
          where d.user_id = u.id
        ), '[]'::jsonb)
        else '[]'::jsonb
      end
    ) order by public.ridelink_rank(u.role) desc, u.created_at)
    from public.ridelink_user u
  ), '[]'::jsonb);
end;
$$;

create or replace function public.ridelink_admin_create_user(
  p_token_hash   text,
  p_email        text,
  p_display_name text,
  p_role         text,
  p_password     text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if not public.ridelink_can_manage(v_actor.role, p_role) then
    return jsonb_build_object('ok', false, 'code', 'denied');
  end if;
  if exists (select 1 from public.ridelink_user where email = v_email) then
    return jsonb_build_object('ok', false, 'code', 'exists');
  end if;
  if octet_length(coalesce(p_password, '')) not between 10 and 72 then
    return jsonb_build_object('ok', false, 'code', 'weak');
  end if;
  insert into public.ridelink_user (email, display_name, role, password_hash, created_by)
  values (v_email, btrim(p_display_name), p_role,
          extensions.crypt(p_password, extensions.gen_salt('bf', 12)), v_actor.id);
  return jsonb_build_object('ok', true, 'code', null);
exception
  when check_violation or not_null_violation then
    return jsonb_build_object('ok', false, 'code', 'invalid');
end;
$$;

create or replace function public.ridelink_admin_update_user(
  p_token_hash   text,
  p_user_id      uuid,
  p_display_name text,
  p_role         text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_role  text;
begin
  if p_user_id = v_actor.id then
    if p_role is distinct from v_actor.role then
      return jsonb_build_object('ok', false, 'code', 'self');
    end if;
    update public.ridelink_user set display_name = btrim(p_display_name) where id = v_actor.id;
    return jsonb_build_object('ok', true, 'code', null);
  end if;
  select role into v_role from public.ridelink_user where id = p_user_id;
  if v_role is null then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  if not public.ridelink_can_manage(v_actor.role, v_role)
     or not public.ridelink_can_manage(v_actor.role, p_role) then
    return jsonb_build_object('ok', false, 'code', 'denied');
  end if;
  update public.ridelink_user
  set display_name = btrim(p_display_name), role = p_role
  where id = p_user_id;
  return jsonb_build_object('ok', true, 'code', null);
exception
  when check_violation or not_null_violation then
    return jsonb_build_object('ok', false, 'code', 'invalid');
end;
$$;

create or replace function public.ridelink_admin_set_user_blocked(
  p_token_hash text,
  p_user_id    uuid,
  p_blocked    boolean
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_role  text;
begin
  if p_user_id = v_actor.id then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  select role into v_role from public.ridelink_user where id = p_user_id;
  if v_role is null then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  if not public.ridelink_can_manage(v_actor.role, v_role) then
    return jsonb_build_object('ok', false, 'code', 'denied');
  end if;
  update public.ridelink_user set is_blocked = p_blocked where id = p_user_id;
  if p_blocked then
    update public.ridelink_session
    set revoked_at = now(), revoked_reason = 'account_blocked'
    where user_id = p_user_id and revoked_at is null;
  end if;
  return jsonb_build_object('ok', true, 'code', null);
end;
$$;

create or replace function public.ridelink_admin_reset_password(
  p_token_hash text,
  p_user_id    uuid,
  p_password   text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_role  text;
begin
  if p_user_id = v_actor.id then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  select role into v_role from public.ridelink_user where id = p_user_id;
  if v_role is null then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  if not public.ridelink_can_manage(v_actor.role, v_role) then
    return jsonb_build_object('ok', false, 'code', 'denied');
  end if;
  if octet_length(coalesce(p_password, '')) not between 10 and 72 then
    return jsonb_build_object('ok', false, 'code', 'weak');
  end if;
  update public.ridelink_user
  set password_hash = extensions.crypt(p_password, extensions.gen_salt('bf', 12)),
      must_change_password = true,
      password_changed_at = now()
  where id = p_user_id;
  update public.ridelink_session
  set revoked_at = now(), revoked_reason = 'password_reset'
  where user_id = p_user_id and revoked_at is null;
  return jsonb_build_object('ok', true, 'code', null);
end;
$$;

create or replace function public.ridelink_admin_logout_user(
  p_token_hash text,
  p_user_id    uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_role  text;
begin
  if p_user_id = v_actor.id then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  select role into v_role from public.ridelink_user where id = p_user_id;
  if v_role is null then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  if not public.ridelink_can_manage(v_actor.role, v_role) then
    return jsonb_build_object('ok', false, 'code', 'denied');
  end if;
  update public.ridelink_session
  set revoked_at = now(), revoked_reason = 'admin_logout'
  where user_id = p_user_id and revoked_at is null;
  return jsonb_build_object('ok', true, 'code', null);
end;
$$;

create or replace function public.ridelink_admin_delete_user(
  p_token_hash text,
  p_user_id    uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_role  text;
begin
  if p_user_id = v_actor.id then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  select role into v_role from public.ridelink_user where id = p_user_id;
  if v_role is null then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  if not public.ridelink_can_manage(v_actor.role, v_role) then
    return jsonb_build_object('ok', false, 'code', 'denied');
  end if;
  delete from public.ridelink_user where id = p_user_id;
  return jsonb_build_object('ok', true, 'code', null);
end;
$$;

create or replace function public.ridelink_admin_list_devices(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor  public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_device uuid;
begin
  select device_id into v_device from public.ridelink_session where token_hash = p_token_hash;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', d.id,
      'user_id', u.id,
      'email', u.email,
      'display_name', u.display_name,
      'role', u.role,
      'avatar', u.avatar,
      'device_name', d.device_name,
      'user_agent', d.user_agent,
      'first_seen_at', d.first_seen_at,
      'last_login_at', d.last_login_at,
      'last_seen_at', d.last_seen_at,
      'is_blocked', d.is_blocked,
      'blocked_at', d.blocked_at,
      'session_count', (select count(*) from public.ridelink_session s
                        where s.device_id = d.id and s.revoked_at is null and s.expires_at > now()),
      'is_current', d.id = v_device,
      'can_manage', public.ridelink_can_manage(v_actor.role, u.role)
    ) order by d.last_seen_at desc)
    from public.ridelink_device d
    join public.ridelink_user u on u.id = d.user_id
    where u.id = v_actor.id or public.ridelink_can_manage(v_actor.role, u.role)
  ), '[]'::jsonb);
end;
$$;

create or replace function public.ridelink_admin_set_device_blocked(
  p_token_hash text,
  p_device_id  uuid,
  p_blocked    boolean
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_role  text;
begin
  select u.role into v_role
  from public.ridelink_device d
  join public.ridelink_user u on u.id = d.user_id
  where d.id = p_device_id;
  if v_role is null then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  if not public.ridelink_can_manage(v_actor.role, v_role) then
    return jsonb_build_object('ok', false, 'code', 'denied');
  end if;
  if exists (select 1 from public.ridelink_session where token_hash = p_token_hash and device_id = p_device_id) then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  update public.ridelink_device
  set is_blocked = p_blocked,
      blocked_at = case when p_blocked then now() else null end,
      blocked_by = case when p_blocked then v_actor.id else null end
  where id = p_device_id;
  if p_blocked then
    update public.ridelink_session
    set revoked_at = now(), revoked_reason = 'device_blocked'
    where device_id = p_device_id and revoked_at is null;
  end if;
  return jsonb_build_object('ok', true, 'code', null);
end;
$$;

create or replace function public.ridelink_admin_logout_device(
  p_token_hash text,
  p_device_id  uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_role  text;
  v_self  boolean;
begin
  select u.role into v_role
  from public.ridelink_device d
  join public.ridelink_user u on u.id = d.user_id
  where d.id = p_device_id;
  if v_role is null then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  if not public.ridelink_can_manage(v_actor.role, v_role) then
    return jsonb_build_object('ok', false, 'code', 'denied');
  end if;
  v_self := exists (
    select 1 from public.ridelink_session where token_hash = p_token_hash and device_id = p_device_id
  );
  update public.ridelink_session
  set revoked_at = now(), revoked_reason = 'admin_logout'
  where device_id = p_device_id and revoked_at is null and token_hash <> p_token_hash;
  if v_self then
    delete from public.ridelink_session where token_hash = p_token_hash;
  end if;
  return jsonb_build_object('ok', true, 'code', null, 'self', v_self);
end;
$$;

create or replace function public.ridelink_admin_delete_device(
  p_token_hash text,
  p_device_id  uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_role  text;
  v_self  boolean;
begin
  select u.role into v_role
  from public.ridelink_device d
  join public.ridelink_user u on u.id = d.user_id
  where d.id = p_device_id;
  if v_role is null then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  if not public.ridelink_can_manage(v_actor.role, v_role) then
    return jsonb_build_object('ok', false, 'code', 'denied');
  end if;
  if exists (select 1 from public.ridelink_device where id = p_device_id and is_blocked) then
    return jsonb_build_object('ok', false, 'code', 'blocked');
  end if;
  v_self := exists (
    select 1 from public.ridelink_session where token_hash = p_token_hash and device_id = p_device_id
  );
  delete from public.ridelink_device where id = p_device_id;
  return jsonb_build_object('ok', true, 'code', null, 'self', v_self);
end;
$$;

create or replace function public.ridelink_contact_list(
  p_token_hash text,
  p_status     text,
  p_inquiry    text,
  p_search     text,
  p_limit      integer,
  p_offset     integer
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor  public.ridelink_user := public.ridelink_actor(p_token_hash, 'sub');
  v_search text := nullif(btrim(coalesce(p_search, '')), '');
  v_limit  integer := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
begin
  return (
    with filtered as (
      select c.*
      from public.ridelink_contact_message c
      where (p_status is null or c.status = p_status)
        and (p_inquiry is null or c.inquiry_type = p_inquiry)
        and (v_search is null
             or c.name ilike '%' || v_search || '%'
             or c.email ilike '%' || v_search || '%'
             or c.message ilike '%' || v_search || '%')
    ),
    page as (
      select * from filtered order by submitted_at desc limit v_limit offset v_offset
    )
    select jsonb_build_object(
      'items', coalesce((
        select jsonb_agg(to_jsonb(p) - 'ip_hash' order by p.submitted_at desc) from page p
      ), '[]'::jsonb),
      'total', (select count(*) from filtered),
      'counts', coalesce((
        select jsonb_object_agg(status, n)
        from (select status, count(*) as n from public.ridelink_contact_message group by status) s
      ), '{}'::jsonb),
      'people', coalesce((
        select jsonb_object_agg(u.id, jsonb_build_object(
          'name', u.display_name, 'email', u.email, 'role', u.role, 'avatar', u.avatar))
        from public.ridelink_user u
        where u.id in (select status_by from page)
      ), '{}'::jsonb)
    )
  );
end;
$$;

create or replace function public.ridelink_contact_update(
  p_token_hash text,
  p_id         uuid,
  p_status     text,
  p_admin_note text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'sub');
begin
  if char_length(coalesce(p_admin_note, '')) > 2000 then
    return jsonb_build_object('ok', false, 'code', 'invalid');
  end if;
  update public.ridelink_contact_message
  set admin_note = case when p_admin_note is null then admin_note
                        else nullif(btrim(p_admin_note), '') end,
      status_by = case when p_status is not null and p_status <> status then v_actor.id
                       else status_by end,
      status_by_name = case when p_status is not null and p_status <> status then v_actor.display_name
                            else status_by_name end,
      status_at = case when p_status is not null and p_status <> status then now()
                       else status_at end,
      status = coalesce(p_status, status)
  where id = p_id;
  return jsonb_build_object('ok', found, 'code', case when found then null else 'not_found' end);
exception
  when check_violation or not_null_violation then
    return jsonb_build_object('ok', false, 'code', 'invalid');
end;
$$;

do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig, p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and (p.proname like 'ridelink\_auth\_%' or p.proname like 'ridelink\_admin\_%'
           or p.proname in ('ridelink_contact_list', 'ridelink_contact_update', 'ridelink_actor',
                            'ridelink_login_fail', 'ridelink_rank', 'ridelink_can_manage'))
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    if f.proname in ('ridelink_actor', 'ridelink_login_fail', 'ridelink_rank', 'ridelink_can_manage') then
      execute format('revoke all on function %s from service_role', f.sig);
    else
      execute format('grant execute on function %s to service_role', f.sig);
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';

do $$
declare
  v_count integer;
  v_fn    record;
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ridelink_user' and column_name = 'avatar'
  ) or not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ridelink_contact_message' and column_name = 'status_by'
  ) then
    raise exception 'ABORT: a new ridelink column is missing.';
  end if;

  if to_regprocedure('public.ridelink_auth_profile(text)') is null
     or to_regprocedure('public.ridelink_auth_set_avatar(text, text)') is null
     or to_regprocedure('public.ridelink_can_manage(text, text)') is null then
    raise exception 'ABORT: a new ridelink function was not created.';
  end if;

  if public.ridelink_can_manage('owner', 'owner') or public.ridelink_can_manage('owner', 'admin')
     or public.ridelink_can_manage('sub', 'sub') or not public.ridelink_can_manage('owner', 'sub')
     or not public.ridelink_can_manage('admin', 'admin') then
    raise exception 'ABORT: ridelink_can_manage gives the wrong answer.';
  end if;

  select count(*) into v_count
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in ('ridelink_user', 'ridelink_device', 'ridelink_session', 'ridelink_login_attempt')
    and grantee in ('anon', 'authenticated', 'service_role');
  if v_count > 0 then
    raise exception 'ABORT: % direct grant(s) remain on the ridelink admin tables.', v_count;
  end if;

  for v_fn in
    select p.oid::regprocedure::text as sig, p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and (p.proname like 'ridelink\_auth\_%' or p.proname like 'ridelink\_admin\_%'
           or p.proname in ('ridelink_contact_list', 'ridelink_contact_update', 'ridelink_actor',
                            'ridelink_login_fail', 'ridelink_rank', 'ridelink_can_manage'))
  loop
    if has_function_privilege('anon', v_fn.sig, 'EXECUTE')
       or has_function_privilege('authenticated', v_fn.sig, 'EXECUTE') then
      raise exception 'ABORT: anon or authenticated can EXECUTE %.', v_fn.sig;
    end if;
    if v_fn.proname in ('ridelink_actor', 'ridelink_login_fail', 'ridelink_rank', 'ridelink_can_manage') then
      if has_function_privilege('service_role', v_fn.sig, 'EXECUTE') then
        raise exception 'ABORT: service_role can EXECUTE the internal helper %.', v_fn.sig;
      end if;
    elsif not has_function_privilege('service_role', v_fn.sig, 'EXECUTE') then
      raise exception 'ABORT: service_role cannot EXECUTE %.', v_fn.sig;
    end if;
  end loop;
end $$;
