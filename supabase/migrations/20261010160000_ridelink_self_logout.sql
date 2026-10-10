alter table public.ridelink_session drop constraint if exists ridelink_session_revoked_ck;
alter table public.ridelink_session add constraint ridelink_session_revoked_ck
  check ((revoked_at is null) = (revoked_reason is null)
     and (revoked_reason is null or revoked_reason in
          ('admin_logout', 'self_logout', 'account_blocked', 'device_blocked',
           'password_reset', 'password_changed')));

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
  set revoked_at = now(),
      revoked_reason = case when v_owner = v_actor.id then 'self_logout' else 'admin_logout' end
  where device_id = p_device_id and revoked_at is null and token_hash <> p_token_hash;
  if v_self then
    delete from public.ridelink_session where token_hash = p_token_hash;
  end if;
  return jsonb_build_object('ok', true, 'code', null, 'self', v_self);
end;
$$;

notify pgrst, 'reload schema';

do $$
begin
  if not has_function_privilege('service_role', 'public.ridelink_admin_logout_device(text, uuid)', 'EXECUTE')
     or has_function_privilege('anon', 'public.ridelink_admin_logout_device(text, uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.ridelink_admin_logout_device(text, uuid)', 'EXECUTE') then
    raise exception 'ABORT: ridelink_admin_logout_device grants drifted.';
  end if;
end $$;
