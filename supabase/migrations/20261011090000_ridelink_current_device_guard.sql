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
  if exists (select 1 from public.ridelink_session where token_hash = p_token_hash and device_id = p_device_id) then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  if exists (select 1 from public.ridelink_device where id = p_device_id and is_blocked) then
    return jsonb_build_object('ok', false, 'code', 'blocked');
  end if;
  delete from public.ridelink_device where id = p_device_id;
  return jsonb_build_object('ok', true, 'code', null);
end;
$$;

notify pgrst, 'reload schema';

do $$
begin
  if not has_function_privilege('service_role', 'public.ridelink_admin_delete_device(text, uuid)', 'EXECUTE')
     or has_function_privilege('anon', 'public.ridelink_admin_delete_device(text, uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.ridelink_admin_delete_device(text, uuid)', 'EXECUTE') then
    raise exception 'ABORT: ridelink_admin_delete_device grants drifted.';
  end if;
end $$;
