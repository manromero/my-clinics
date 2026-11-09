insert into public.clinics (id, name, percentage) overriding system value values
  (9, 'Read access fixture 9', 0),
  (10, 'Read access fixture 10', 100),
  (9007199254740993, 'Read access fixture bigint', 37.25);

do $$
begin
  if has_table_privilege('anon', 'public.clinics', 'SELECT')
    or has_table_privilege('service_role', 'public.clinics', 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
    or has_table_privilege('authenticated', 'public.clinics', 'INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
    or has_sequence_privilege('anon', 'public.clinics_id_seq', 'USAGE, SELECT, UPDATE')
    or has_sequence_privilege('authenticated', 'public.clinics_id_seq', 'USAGE, SELECT, UPDATE')
    or has_function_privilege('anon', 'public.clinic_name_key(text)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.clinic_name_key(text)', 'EXECUTE') then
    raise exception 'Unexpected effective clinic privilege';
  end if;
end $$;

set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
do $$
begin
  begin
    perform id from public.clinics;
  exception when insufficient_privilege then
    return;
  end;
  raise exception 'Anonymous clinic SELECT was accepted';
end $$;
reset role;

set local role authenticated;
do $$
declare
  claims jsonb;
  statement text;
  rows jsonb;
begin
  foreach claims in array array[
    '{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000010","is_anonymous":false,"user_metadata":{"myclinics_clinic_reader":true}}'::jsonb,
    '{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000010","is_anonymous":false,"app_metadata":{"myclinics_clinic_reader":"true"}}'::jsonb,
    '{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000010","is_anonymous":true,"app_metadata":{"myclinics_clinic_reader":true}}'::jsonb,
    '{"role":"authenticated","is_anonymous":false,"app_metadata":{"myclinics_clinic_reader":true}}'::jsonb
  ] loop
    perform set_config('request.jwt.claims', claims::text, true);
    if exists (select 1 from public.clinics) then
      raise exception 'Unapproved claims can read clinic rows';
    end if;
  end loop;

  perform set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-4000-8000-000000000011","is_anonymous":false,"app_metadata":{"myclinics_clinic_reader":true}}', true);
  select jsonb_agg(id::text order by id) into rows
    from public.clinics where name like 'Read access fixture %';
  if rows is distinct from '["9","10","9007199254740993"]'::jsonb then
    raise exception 'Approved claims cannot read exact, numerically ordered clinic IDs';
  end if;

  foreach statement in array array[
    'insert into public.clinics (name, percentage) values (''Denied write'', 10)',
    'update public.clinics set active = false where id = 9',
    'delete from public.clinics where id = 9',
    'truncate public.clinics'
  ] loop
    begin
      execute statement;
    exception when insufficient_privilege then
      continue;
    end;
    raise exception 'Approved reader can mutate clinics';
  end loop;
end $$;
reset role;
