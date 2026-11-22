insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002');

insert into public.clinics (id, owner_id, name, percentage) overriding system value values
  (9007199254740993, '00000000-0000-4000-8000-000000000001', 'Owner A clinic', 37.25),
  (-2, '00000000-0000-4000-8000-000000000002', 'Owner B clinic', 100),
  (-3, null, 'Unassigned legacy clinic', 0);

do $$
declare role_name text;
begin
  if not (select relrowsecurity from pg_class where oid = 'public.clinics'::regclass)
    or has_table_privilege('authenticated', 'public.clinics', 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
    or has_column_privilege('authenticated', 'public.clinics', 'id', 'INSERT, UPDATE')
    or has_column_privilege('authenticated', 'public.clinics', 'owner_id', 'SELECT, UPDATE')
    or has_column_privilege('authenticated', 'public.clinics', 'active', 'INSERT')
    or not has_function_privilege('authenticated', 'public.clinic_name_key(text)', 'EXECUTE') then
    raise exception 'Unexpected authenticated privilege';
  end if;
  foreach role_name in array array['anon', 'authenticated', 'service_role'] loop
    if has_sequence_privilege(role_name, 'public.clinics_id_seq', 'USAGE, SELECT, UPDATE') then
      raise exception 'Unexpected direct access to clinic sequence for %', role_name;
    end if;
  end loop;
  foreach role_name in array array['anon', 'service_role'] loop
    if has_table_privilege(role_name, 'public.clinics', 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
      or has_any_column_privilege(role_name, 'public.clinics', 'SELECT, INSERT, UPDATE, REFERENCES')
      or has_function_privilege(role_name, 'public.clinic_name_key(text)', 'EXECUTE') then
      raise exception 'Unexpected clinic access for %', role_name;
    end if;
  end loop;
end $$;

create function pg_temp.expect_clinic_denial(statement text, expected_state text default '42501')
returns void language plpgsql as $$
begin
  begin
    execute statement;
  exception when others then
    if sqlstate <> expected_state then
      raise exception 'Unexpected SQLSTATE % for %', sqlstate, statement;
    end if;
    return;
  end;
  raise exception 'Operation unexpectedly accepted: %', statement;
end $$;

set local role anon;
select pg_temp.expect_clinic_denial('select id from public.clinics');
select pg_temp.expect_clinic_denial($s$insert into public.clinics(name, percentage) values ('Anon', 10)$s$);
select pg_temp.expect_clinic_denial('update public.clinics set active=false');
select pg_temp.expect_clinic_denial('delete from public.clinics');
reset role;

set local role authenticated;
do $$
begin
  if exists (select id from public.clinics) then
    raise exception 'Authenticated role without a subject saw clinic rows';
  end if;
end $$;
select pg_temp.expect_clinic_denial($s$insert into public.clinics(owner_id, name, percentage)
  values ('00000000-0000-4000-8000-000000000001', 'No subject', 10)$s$);

set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}';
do $$
declare new_id bigint;
begin
  if (select array_agg(id::text order by id) from public.clinics)
    is distinct from array['9007199254740993'] then
    raise exception 'Owner A saw rows beyond its own exact bigint ID';
  end if;
  insert into public.clinics (owner_id, name, percentage)
    values (auth.uid(), 'Shared name', 12.34) returning id into new_id;
  if new_id <= 0 or not exists (
    select id from public.clinics where id = new_id and active and percentage = 12.34
  ) then raise exception 'Generated ID, active default or percentage missing'; end if;

  update public.clinics set name = 'Owner A revised', percentage = 35, active = false
    where id = 9007199254740993;
  if not exists (select id from public.clinics where id = 9007199254740993
    and name = 'Owner A revised' and percentage = 35 and not active) then
    raise exception 'Owner A edit/deactivation failed';
  end if;
  update public.clinics set active = true where id = 9007199254740993;
  if not exists (select id from public.clinics where id = 9007199254740993 and active) then
    raise exception 'Owner A reactivation failed';
  end if;
  update public.clinics set active = false where id in (-2, -3);
  if found then raise exception 'Owner A updated another owner or legacy row'; end if;
end $$;
select pg_temp.expect_clinic_denial($s$insert into public.clinics(owner_id, name, percentage)
  values (auth.uid(), E'\tSHARED NAME\n', 20)$s$, '23505');
select pg_temp.expect_clinic_denial($s$update public.clinics set name = ' shared NAME ' where id = 9007199254740993$s$, '23505');
select pg_temp.expect_clinic_denial($s$insert into public.clinics(owner_id, name, percentage)
  values ('00000000-0000-4000-8000-000000000002', 'Forged owner', 10)$s$);
select pg_temp.expect_clinic_denial($s$insert into public.clinics(name, percentage) values ('No owner', 10)$s$);
select pg_temp.expect_clinic_denial('update public.clinics set owner_id=null where id=9007199254740993');
select pg_temp.expect_clinic_denial('update public.clinics set id=default where id=9007199254740993');
select pg_temp.expect_clinic_denial('delete from public.clinics where id=9007199254740993');
select pg_temp.expect_clinic_denial('truncate public.clinics');

set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}';
do $$
begin
  if (select array_agg(id) from public.clinics) is distinct from array[-2::bigint] then
    raise exception 'Owner B saw rows beyond its own';
  end if;
  insert into public.clinics (owner_id, name, percentage) values (auth.uid(), ' shared NAME ', 20);
  update public.clinics set active=false where id=-2;
  if not exists (select id from public.clinics where id=-2 and not active) then
    raise exception 'Owner B could not create with the same name or edit its own row';
  end if;
  update public.clinics set name='Hijacked clinic' where id=9007199254740993;
  if found then raise exception 'Owner B updated Owner A clinic'; end if;
end $$;
reset role;

-- Isolate the UPDATE policy's resulting-row check from the production column grant.
grant update (owner_id) on public.clinics to authenticated;
set local role authenticated;
select pg_temp.expect_clinic_denial($s$update public.clinics
  set owner_id='00000000-0000-4000-8000-000000000001' where id=-2$s$);
reset role;
