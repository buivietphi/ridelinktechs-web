alter table public.ridelink_session
  add column if not exists revoked_at     timestamptz,
  add column if not exists revoked_reason text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ridelink_session_revoked_ck') then
    alter table public.ridelink_session add constraint ridelink_session_revoked_ck
      check ((revoked_at is null) = (revoked_reason is null)
         and (revoked_reason is null or revoked_reason in
              ('admin_logout', 'account_blocked', 'device_blocked', 'password_reset', 'password_changed')));
  end if;
end $$;

comment on column public.ridelink_session.revoked_at is
  'Set when an admin action or a password change ends this session. The row is kept until it expires so the signed-out browser can be told why.';

create or replace function public.ridelink_actor(
  p_token_hash    text,
  p_min_role      text,
  p_allow_pending boolean default false
) returns public.ridelink_user
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user public.ridelink_user;
begin
  select u.* into v_user
  from public.ridelink_session s
  join public.ridelink_user u on u.id = s.user_id
  join public.ridelink_device d on d.id = s.device_id
  where s.token_hash = p_token_hash
    and s.revoked_at is null
    and s.expires_at > now()
    and not u.is_blocked
    and not d.is_blocked;
  if v_user.id is null then
    raise exception 'unauthenticated';
  end if;
  if v_user.must_change_password and not p_allow_pending then
    raise exception 'password_change_required';
  end if;
  if public.ridelink_rank(v_user.role) < public.ridelink_rank(p_min_role) then
    raise exception 'forbidden';
  end if;
  return v_user;
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
    'must_change_password', v_user.must_change_password,
    'device_id', v_session.device_id
  );
end;
$$;

create or replace function public.ridelink_auth_change_password(
  p_token_hash text,
  p_current    text,
  p_new        text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'sub', true);
begin
  if extensions.crypt(coalesce(p_current, ''), v_actor.password_hash) <> v_actor.password_hash then
    return jsonb_build_object('ok', false, 'code', 'wrong_password');
  end if;
  if octet_length(coalesce(p_new, '')) not between 10 and 72 then
    return jsonb_build_object('ok', false, 'code', 'weak');
  end if;
  update public.ridelink_user
  set password_hash = extensions.crypt(p_new, extensions.gen_salt('bf', 12)),
      must_change_password = false,
      password_changed_at = now()
  where id = v_actor.id;
  update public.ridelink_session
  set revoked_at = now(), revoked_reason = 'password_changed'
  where user_id = v_actor.id and token_hash <> p_token_hash and revoked_at is null;
  return jsonb_build_object('ok', true, 'code', null);
end;
$$;

create or replace function public.ridelink_admin_list_users(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'display_name', u.display_name,
      'role', u.role,
      'is_blocked', u.is_blocked,
      'must_change_password', u.must_change_password,
      'created_at', u.created_at,
      'last_login_at', u.last_login_at,
      'device_count', (select count(*) from public.ridelink_device d where d.user_id = u.id),
      'session_count', (select count(*) from public.ridelink_session s
                        where s.user_id = u.id and s.revoked_at is null and s.expires_at > now()),
      'is_self', u.id = v_actor.id
    ) order by public.ridelink_rank(u.role) desc, u.created_at)
    from public.ridelink_user u
  ), '[]'::jsonb);
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
begin
  if p_user_id = v_actor.id then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  update public.ridelink_user set is_blocked = p_blocked where id = p_user_id;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
begin
  if p_user_id = v_actor.id then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  if octet_length(coalesce(p_password, '')) not between 10 and 72 then
    return jsonb_build_object('ok', false, 'code', 'weak');
  end if;
  update public.ridelink_user
  set password_hash = extensions.crypt(p_password, extensions.gen_salt('bf', 12)),
      must_change_password = true,
      password_changed_at = now()
  where id = p_user_id;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
begin
  if p_user_id = v_actor.id then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  if not exists (select 1 from public.ridelink_user where id = p_user_id) then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  update public.ridelink_session
  set revoked_at = now(), revoked_reason = 'admin_logout'
  where user_id = p_user_id and revoked_at is null;
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
  v_actor  public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
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
      'device_name', d.device_name,
      'user_agent', d.user_agent,
      'first_seen_at', d.first_seen_at,
      'last_login_at', d.last_login_at,
      'last_seen_at', d.last_seen_at,
      'is_blocked', d.is_blocked,
      'blocked_at', d.blocked_at,
      'session_count', (select count(*) from public.ridelink_session s
                        where s.device_id = d.id and s.revoked_at is null and s.expires_at > now()),
      'is_current', d.id = v_device
    ) order by d.last_seen_at desc)
    from public.ridelink_device d
    join public.ridelink_user u on u.id = d.user_id
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
begin
  if exists (select 1 from public.ridelink_session where token_hash = p_token_hash and device_id = p_device_id) then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  update public.ridelink_device
  set is_blocked = p_blocked,
      blocked_at = case when p_blocked then now() else null end,
      blocked_by = case when p_blocked then v_actor.id else null end
  where id = p_device_id;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
begin
  if exists (select 1 from public.ridelink_session where token_hash = p_token_hash and device_id = p_device_id) then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  update public.ridelink_session
  set revoked_at = now(), revoked_reason = 'admin_logout'
  where device_id = p_device_id and revoked_at is null;
  return jsonb_build_object('ok', true, 'code', null);
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
begin
  if char_length(coalesce(p_admin_note, '')) > 2000 then
    return jsonb_build_object('ok', false, 'code', 'invalid');
  end if;
  update public.ridelink_contact_message
  set status = coalesce(p_status, status),
      admin_note = case when p_admin_note is null then admin_note
                        else nullif(btrim(p_admin_note), '') end
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
           or p.proname in ('ridelink_contact_list', 'ridelink_contact_update',
                            'ridelink_actor', 'ridelink_login_fail', 'ridelink_rank'))
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    if f.proname in ('ridelink_actor', 'ridelink_login_fail', 'ridelink_rank') then
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
    where table_schema = 'public' and table_name = 'ridelink_session' and column_name = 'revoked_reason'
  ) then
    raise exception 'ABORT: ridelink_session.revoked_reason is missing.';
  end if;

  if to_regprocedure('public.ridelink_admin_logout_user(text, uuid)') is null then
    raise exception 'ABORT: ridelink_admin_logout_user was not created.';
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
           or p.proname in ('ridelink_contact_list', 'ridelink_contact_update',
                            'ridelink_actor', 'ridelink_login_fail', 'ridelink_rank'))
  loop
    if has_function_privilege('anon', v_fn.sig, 'EXECUTE')
       or has_function_privilege('authenticated', v_fn.sig, 'EXECUTE') then
      raise exception 'ABORT: anon or authenticated can EXECUTE %.', v_fn.sig;
    end if;
    if v_fn.proname in ('ridelink_actor', 'ridelink_login_fail', 'ridelink_rank') then
      if has_function_privilege('service_role', v_fn.sig, 'EXECUTE') then
        raise exception 'ABORT: service_role can EXECUTE the internal helper %.', v_fn.sig;
      end if;
    elsif not has_function_privilege('service_role', v_fn.sig, 'EXECUTE') then
      raise exception 'ABORT: service_role cannot EXECUTE %.', v_fn.sig;
    end if;
  end loop;
end $$;
