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
  v_actor  public.ridelink_user := public.ridelink_actor(p_token_hash, 'sub');
  v_device public.ridelink_device;
  v_role   text;
  v_manage boolean;
begin
  select d.* into v_device from public.ridelink_device d where d.id = p_device_id;
  if v_device.id is null then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  select role into v_role from public.ridelink_user where id = v_device.user_id;
  v_manage := public.ridelink_can_manage(v_actor.role, v_role);
  if not v_manage and v_device.user_id <> v_actor.id then
    return jsonb_build_object('ok', false, 'code', 'denied');
  end if;
  if not v_manage and not p_blocked and v_device.blocked_by is distinct from v_actor.id then
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'sub');
  v_owner uuid;
  v_role  text;
  v_self  boolean;
begin
  select d.user_id, u.role into v_owner, v_role
  from public.ridelink_device d
  join public.ridelink_user u on u.id = d.user_id
  where d.id = p_device_id;
  if v_owner is null then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  if not public.ridelink_can_manage(v_actor.role, v_role) and v_owner <> v_actor.id then
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'sub');
  v_owner uuid;
  v_role  text;
  v_self  boolean;
begin
  select d.user_id, u.role into v_owner, v_role
  from public.ridelink_device d
  join public.ridelink_user u on u.id = d.user_id
  where d.id = p_device_id;
  if v_owner is null then
    return jsonb_build_object('ok', false, 'code', 'not_found');
  end if;
  if not public.ridelink_can_manage(v_actor.role, v_role) and v_owner <> v_actor.id then
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
      'can_manage', public.ridelink_can_manage(v_actor.role, u.role) or u.id = v_actor.id,
      'can_unlock', public.ridelink_can_manage(v_actor.role, u.role) or d.blocked_by = v_actor.id
    ) order by d.last_seen_at desc)
    from public.ridelink_device d
    join public.ridelink_user u on u.id = d.user_id
    where u.id = v_actor.id or public.ridelink_can_manage(v_actor.role, u.role)
  ), '[]'::jsonb);
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
            'can_manage', true,
            'can_unlock', public.ridelink_can_manage(v_actor.role, u.role) or d.blocked_by = v_actor.id
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
        'is_current', d.id = v_device,
        'can_manage', true,
        'can_unlock', public.ridelink_can_manage(v_actor.role, v_actor.role) or d.blocked_by = v_actor.id
      ) order by d.last_seen_at desc)
      from public.ridelink_device d
      where d.user_id = v_actor.id
    ), '[]'::jsonb)
  );
end;
$$;

notify pgrst, 'reload schema';

do $$
declare
  v_fn record;
begin
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
