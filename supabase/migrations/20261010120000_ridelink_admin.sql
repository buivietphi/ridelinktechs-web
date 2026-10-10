create table if not exists public.ridelink_user (
  id                   uuid primary key default gen_random_uuid(),
  email                text        not null,
  display_name         text        not null,
  role                 text        not null,
  password_hash        text        not null,
  must_change_password boolean     not null default true,
  is_blocked           boolean     not null default false,
  created_by           uuid references public.ridelink_user (id) on delete set null,
  created_at           timestamptz not null default now(),
  password_changed_at  timestamptz,
  last_login_at        timestamptz,
  constraint ridelink_user_email_ck
    check (email = lower(btrim(email))
       and char_length(email) between 3 and 254
       and email ~ '^[^@[:space:]<>]+@[^@[:space:]]+\.[^@[:space:]<>]+$'),
  constraint ridelink_user_display_name_ck
    check (char_length(btrim(display_name)) between 1 and 80),
  constraint ridelink_user_role_ck
    check (role in ('admin', 'owner', 'sub')),
  constraint ridelink_user_password_hash_ck
    check (password_hash like '$2_$%')
);
create unique index if not exists ridelink_user_email_key on public.ridelink_user (email);
comment on table public.ridelink_user is
  'RideLink Techs admin accounts, dedicated to ridelinktechs.com /admin. Separate from VibeHolic admin_user and from auth.users on purpose. Roles: admin (accounts, devices, contacts), owner (contacts), sub (sign in only). Read and written ONLY through the ridelink_auth_* and ridelink_admin_* functions.';

create table if not exists public.ridelink_device (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid        not null references public.ridelink_user (id) on delete cascade,
  device_hash   text        not null,
  device_name   text        not null,
  user_agent    text,
  ip_hash       text,
  first_seen_at timestamptz not null default now(),
  last_login_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  is_blocked    boolean     not null default false,
  blocked_at    timestamptz,
  blocked_by    uuid references public.ridelink_user (id) on delete set null,
  constraint ridelink_device_user_hash_key unique (user_id, device_hash),
  constraint ridelink_device_hash_ck check (device_hash ~ '^[0-9a-f]{8,128}$'),
  constraint ridelink_device_name_ck check (char_length(device_name) between 1 and 80),
  constraint ridelink_device_user_agent_ck check (user_agent is null or char_length(user_agent) <= 512),
  constraint ridelink_device_ip_hash_ck check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$')
);
comment on table public.ridelink_device is
  'Browsers that signed in to ridelinktechs.com /admin, one row per account and ThumbmarkJS hash. A blocked device cannot sign in and its sessions are dropped.';

create table if not exists public.ridelink_session (
  id           uuid primary key default gen_random_uuid(),
  token_hash   text        not null unique,
  user_id      uuid        not null references public.ridelink_user (id) on delete cascade,
  device_id    uuid        not null references public.ridelink_device (id) on delete cascade,
  ip_hash      text,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at   timestamptz not null,
  constraint ridelink_session_token_hash_ck check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint ridelink_session_ip_hash_ck check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$')
);
create index if not exists ridelink_session_user_id_idx on public.ridelink_session (user_id);
create index if not exists ridelink_session_device_id_idx on public.ridelink_session (device_id);
comment on table public.ridelink_session is
  'Signed-in sessions for /admin. Holds only the SHA-256 of the cookie token; deleting a row signs that browser out.';

create table if not exists public.ridelink_login_attempt (
  key            text        primary key,
  fail_count     integer     not null default 0,
  window_started timestamptz not null default now(),
  locked_until   timestamptz,
  constraint ridelink_login_attempt_key_ck check (char_length(key) between 3 and 300)
);
comment on table public.ridelink_login_attempt is
  'Failed /admin sign-in counters, keyed email:<address> and ip:<hash>.';

alter table public.ridelink_user enable row level security;
alter table public.ridelink_device enable row level security;
alter table public.ridelink_session enable row level security;
alter table public.ridelink_login_attempt enable row level security;
revoke all on table public.ridelink_user, public.ridelink_device, public.ridelink_session, public.ridelink_login_attempt
  from anon, authenticated, service_role;

create or replace function public.ridelink_rank(p_role text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case p_role when 'admin' then 3 when 'owner' then 2 when 'sub' then 1 else 0 end;
$$;

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

create or replace function public.ridelink_login_fail(
  p_key         text,
  p_max         integer,
  p_window_secs integer,
  p_lock_secs   integer
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.ridelink_login_attempt;
begin
  select * into v_row from public.ridelink_login_attempt where key = p_key for update;
  if v_row.key is null or v_row.window_started < now() - make_interval(secs => p_window_secs) then
    insert into public.ridelink_login_attempt (key, fail_count, window_started, locked_until)
    values (p_key, 1, now(), null)
    on conflict (key) do update
      set fail_count = 1, window_started = now(), locked_until = null;
    return;
  end if;
  update public.ridelink_login_attempt
  set fail_count = v_row.fail_count + 1,
      locked_until = case
        when v_row.fail_count + 1 >= p_max then now() + make_interval(secs => p_lock_secs)
        else v_row.locked_until
      end
  where key = p_key;
end;
$$;

create or replace function public.ridelink_auth_login(
  p_email       text,
  p_password    text,
  p_device_hash text,
  p_device_name text,
  p_user_agent  text,
  p_ip_hash     text,
  p_token_hash  text,
  p_ttl_secs    integer
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email  text := lower(btrim(coalesce(p_email, '')));
  v_now    timestamptz := now();
  v_locked timestamptz;
  v_user   public.ridelink_user;
  v_device public.ridelink_device;
  v_hash   text;
  v_match  boolean;
begin
  select max(locked_until) into v_locked
  from public.ridelink_login_attempt
  where key in ('email:' || v_email, 'ip:' || coalesce(p_ip_hash, '-'))
    and locked_until > v_now;
  if v_locked is not null then
    return jsonb_build_object('ok', false, 'code', 'rate', 'until', v_locked);
  end if;

  select * into v_user from public.ridelink_user where email = v_email;
  v_hash := coalesce(v_user.password_hash, extensions.gen_salt('bf', 12));
  v_match := extensions.crypt(coalesce(p_password, ''), v_hash) = v_hash;
  if v_user.id is null or not v_match then
    perform public.ridelink_login_fail('email:' || v_email, 5, 900, 900);
    if p_ip_hash is not null then
      perform public.ridelink_login_fail('ip:' || p_ip_hash, 20, 900, 3600);
    end if;
    return jsonb_build_object('ok', false, 'code', 'invalid');
  end if;

  delete from public.ridelink_login_attempt where key = 'email:' || v_email;

  if v_user.is_blocked then
    return jsonb_build_object('ok', false, 'code', 'account_blocked');
  end if;

  insert into public.ridelink_device (user_id, device_hash, device_name, user_agent, ip_hash)
  values (v_user.id, p_device_hash, p_device_name, p_user_agent, p_ip_hash)
  on conflict (user_id, device_hash) do update
    set device_name = excluded.device_name,
        user_agent  = excluded.user_agent,
        ip_hash     = excluded.ip_hash
  returning * into v_device;

  if v_device.is_blocked then
    return jsonb_build_object('ok', false, 'code', 'device_blocked');
  end if;

  update public.ridelink_device set last_login_at = v_now, last_seen_at = v_now where id = v_device.id;
  delete from public.ridelink_session where user_id = v_user.id and expires_at <= v_now;
  insert into public.ridelink_session (token_hash, user_id, device_id, ip_hash, expires_at)
  values (p_token_hash, v_user.id, v_device.id, p_ip_hash, v_now + make_interval(secs => p_ttl_secs));
  update public.ridelink_user set last_login_at = v_now where id = v_user.id;

  return jsonb_build_object('ok', true, 'code', null, 'must_change_password', v_user.must_change_password);
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
begin
  select s.* into v_session
  from public.ridelink_session s
  join public.ridelink_user u on u.id = s.user_id
  join public.ridelink_device d on d.id = s.device_id
  where s.token_hash = p_token_hash
    and s.expires_at > now()
    and not u.is_blocked
    and not d.is_blocked;
  if v_session.id is null then
    return jsonb_build_object('ok', false);
  end if;

  if v_session.last_seen_at < now() - interval '1 minute' then
    update public.ridelink_session set last_seen_at = now() where id = v_session.id;
    update public.ridelink_device set last_seen_at = now() where id = v_session.device_id;
  end if;

  select * into v_user from public.ridelink_user where id = v_session.user_id;
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

create or replace function public.ridelink_auth_logout(p_token_hash text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.ridelink_session where token_hash = p_token_hash;
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
  delete from public.ridelink_session where user_id = v_actor.id and token_hash <> p_token_hash;
  return jsonb_build_object('ok', true, 'code', null);
end;
$$;

create or replace function public.ridelink_admin_bootstrap(
  p_email        text,
  p_display_name text,
  p_password     text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  lock table public.ridelink_user in exclusive mode;
  if exists (select 1 from public.ridelink_user) then
    return jsonb_build_object('ok', false, 'code', 'exists');
  end if;
  if octet_length(coalesce(p_password, '')) not between 10 and 72 then
    return jsonb_build_object('ok', false, 'code', 'weak');
  end if;
  insert into public.ridelink_user (email, display_name, role, password_hash, must_change_password, password_changed_at)
  values (lower(btrim(p_email)), btrim(p_display_name), 'admin',
          extensions.crypt(p_password, extensions.gen_salt('bf', 12)), false, now());
  return jsonb_build_object('ok', true, 'code', null);
exception
  when check_violation or not_null_violation then
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
      'session_count', (select count(*) from public.ridelink_session s where s.user_id = u.id and s.expires_at > now()),
      'is_self', u.id = v_actor.id
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
begin
  if p_user_id = v_actor.id and p_role <> 'admin' then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  update public.ridelink_user
  set display_name = btrim(p_display_name), role = p_role
  where id = p_user_id;
  return jsonb_build_object('ok', found, 'code', case when found then null else 'not_found' end);
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
    delete from public.ridelink_session where user_id = p_user_id;
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
  delete from public.ridelink_session where user_id = p_user_id;
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
begin
  if p_user_id = v_actor.id then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  delete from public.ridelink_user where id = p_user_id;
  return jsonb_build_object('ok', found, 'code', case when found then null else 'not_found' end);
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
      'session_count', (select count(*) from public.ridelink_session s where s.device_id = d.id and s.expires_at > now()),
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
    delete from public.ridelink_session where device_id = p_device_id;
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
  delete from public.ridelink_session where device_id = p_device_id;
  return jsonb_build_object('ok', true, 'code', null);
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'admin');
begin
  if exists (select 1 from public.ridelink_session where token_hash = p_token_hash and device_id = p_device_id) then
    return jsonb_build_object('ok', false, 'code', 'self');
  end if;
  if exists (select 1 from public.ridelink_device where id = p_device_id and is_blocked) then
    return jsonb_build_object('ok', false, 'code', 'blocked');
  end if;
  delete from public.ridelink_device where id = p_device_id;
  return jsonb_build_object('ok', found, 'code', case when found then null else 'not_found' end);
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
  v_actor  public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
  v_search text := nullif(btrim(coalesce(p_search, '')), '');
  v_limit  integer := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
begin
  return jsonb_build_object(
    'items', coalesce((
      select jsonb_agg(row_to_json(m)::jsonb - 'ip_hash' order by m.submitted_at desc)
      from (
        select *
        from public.ridelink_contact_message c
        where (p_status is null or c.status = p_status)
          and (p_inquiry is null or c.inquiry_type = p_inquiry)
          and (v_search is null
               or c.name ilike '%' || v_search || '%'
               or c.email ilike '%' || v_search || '%'
               or c.message ilike '%' || v_search || '%')
        order by c.submitted_at desc
        limit v_limit offset v_offset
      ) m
    ), '[]'::jsonb),
    'total', (
      select count(*)
      from public.ridelink_contact_message c
      where (p_status is null or c.status = p_status)
        and (p_inquiry is null or c.inquiry_type = p_inquiry)
        and (v_search is null
             or c.name ilike '%' || v_search || '%'
             or c.email ilike '%' || v_search || '%'
             or c.message ilike '%' || v_search || '%')
    ),
    'counts', coalesce((
      select jsonb_object_agg(status, n)
      from (select status, count(*) as n from public.ridelink_contact_message group by status) s
    ), '{}'::jsonb)
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
  v_actor public.ridelink_user := public.ridelink_actor(p_token_hash, 'owner');
begin
  if char_length(coalesce(p_admin_note, '')) > 2000 then
    return jsonb_build_object('ok', false, 'code', 'invalid');
  end if;
  update public.ridelink_contact_message
  set status = p_status, admin_note = nullif(btrim(coalesce(p_admin_note, '')), '')
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
  select count(*) into v_count
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('ridelink_user', 'ridelink_device', 'ridelink_session', 'ridelink_login_attempt')
    and not c.relrowsecurity;
  if v_count > 0 then
    raise exception 'ABORT: RLS is off on % ridelink admin table(s).', v_count;
  end if;

  select count(*) into v_count
  from pg_policies
  where schemaname = 'public'
    and tablename in ('ridelink_user', 'ridelink_device', 'ridelink_session', 'ridelink_login_attempt');
  if v_count > 0 then
    raise exception 'ABORT: % RLS policy(ies) exist on the ridelink admin tables. This design is deny-all.', v_count;
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
