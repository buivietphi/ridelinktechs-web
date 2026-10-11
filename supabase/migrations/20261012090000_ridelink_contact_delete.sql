create or replace function public.ridelink_contact_delete(
  p_token_hash text,
  p_id         uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
begin
  delete from public.ridelink_contact_message where id = p_id;
  return jsonb_build_object('ok', found, 'code', case when found then null else 'not_found' end);
end;
$$;

revoke all on function public.ridelink_contact_delete(text, uuid) from public, anon, authenticated;
grant execute on function public.ridelink_contact_delete(text, uuid) to service_role;

notify pgrst, 'reload schema';

do $$
begin
  if to_regprocedure('public.ridelink_contact_delete(text, uuid)') is null then
    raise exception 'ABORT: ridelink_contact_delete was not created.';
  end if;
  if has_function_privilege('anon', 'public.ridelink_contact_delete(text, uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.ridelink_contact_delete(text, uuid)', 'EXECUTE') then
    raise exception 'ABORT: anon or authenticated can EXECUTE ridelink_contact_delete.';
  end if;
  if not has_function_privilege('service_role', 'public.ridelink_contact_delete(text, uuid)', 'EXECUTE') then
    raise exception 'ABORT: service_role cannot EXECUTE ridelink_contact_delete.';
  end if;
end $$;
