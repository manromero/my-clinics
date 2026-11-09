insert into public.clinics (id, name, percentage) overriding system value values
  (9, 'Read access fixture 9', 0),
  (10, 'Read access fixture 10', 100),
  (9007199254740993, 'Read access fixture bigint', 37.25);

do $$
declare role_name text;
begin
  if not (select relrowsecurity from pg_class where oid = 'public.clinics'::regclass)
    or has_table_privilege('anon', 'public.clinics', 'TRUNCATE, REFERENCES, TRIGGER')
    or has_column_privilege('anon', 'public.clinics', 'id', 'INSERT, UPDATE')
    or not has_function_privilege('anon', 'public.clinic_name_key(text)', 'EXECUTE') then
    raise exception 'Unexpected effective clinic privilege';
  end if;
  foreach role_name in array array['anon', 'authenticated', 'service_role'] loop
    if has_sequence_privilege(role_name, 'public.clinics_id_seq', 'USAGE, SELECT, UPDATE') then
      raise exception 'Unexpected direct access to clinic sequence';
    end if;
  end loop;
  foreach role_name in array array['authenticated', 'service_role'] loop
    if has_table_privilege(role_name, 'public.clinics', 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
      or has_any_column_privilege(role_name, 'public.clinics', 'SELECT, INSERT, UPDATE, REFERENCES')
      or has_function_privilege(role_name, 'public.clinic_name_key(text)', 'EXECUTE') then
      raise exception 'Non-development role has clinic access';
    end if;
  end loop;
end $$;

set local role anon;
do $$
declare
  fixture_id bigint;
  rows jsonb;
  initial_rows jsonb;
  attempt record;
begin
  select jsonb_agg(id::text order by id) into rows
    from public.clinics where name like 'Read access fixture %';
  if rows is distinct from '["9","10","9007199254740993"]'::jsonb then
    raise exception 'Anonymous role cannot read exact, numerically ordered IDs';
  end if;
  select jsonb_agg(to_jsonb(clinics) order by id) into initial_rows from public.clinics;

  insert into public.clinics (name, percentage) values ('Disposable write clinic', 12.34)
    returning id into fixture_id;
  if not exists (select 1 from public.clinics where id = fixture_id and active and percentage = 12.34) then
    raise exception 'Anonymous insert lost generated ID, default status or percentage';
  end if;
  update public.clinics set name = 'Disposable write clinic revised', percentage = 100, active = false
    where id = fixture_id;
  if not exists (select 1 from public.clinics where id = fixture_id and not active and percentage = 100) then
    raise exception 'Anonymous edit or state change failed';
  end if;

  for attempt in select * from (values
    ('insert into public.clinics(name, percentage) values ('' DISPOSABLE WRITE CLINIC REVISED '', 10)', '23505'),
    ('insert into public.clinics(name, percentage) values ('' '', 10)', '23514'),
    ('insert into public.clinics(name, percentage) values (''Out of range'', 101)', '23514'),
    (format('update public.clinics set percentage = 1.001 where id = %L', fixture_id), '23514'),
    (format('update public.clinics set id = default where id = %L', fixture_id), '42501'),
    ('insert into public.clinics(id, name, percentage) overriding system value values (99, ''ID override'', 10)', '42501'),
    ('truncate public.clinics', '42501')
  ) as cases(statement, expected) loop
    begin
      execute attempt.statement;
    exception when others then
      if sqlstate <> attempt.expected then
        raise exception 'Unexpected anonymous operation result: %', sqlstate;
      end if;
      continue;
    end;
    raise exception 'Invalid anonymous operation was accepted';
  end loop;

  delete from public.clinics where id = fixture_id;
  if not found then raise exception 'Anonymous fixture deletion failed'; end if;
  select jsonb_agg(to_jsonb(clinics) order by id) into rows from public.clinics;
  if rows is distinct from initial_rows then raise exception 'Existing clinics changed during CRUD validation'; end if;
end $$;
reset role;

-- Prove the scoped EXECUTE grant is needed by the name constraint. The runner
-- rolls back this test, including the revoke and all fixture row changes.
revoke execute on function public.clinic_name_key(text) from anon;
set local role anon;
do $$
begin
  begin
    insert into public.clinics (name, percentage) values ('Missing helper privilege', 10);
  exception when insufficient_privilege then
    return;
  end;
  raise exception 'Anonymous insert passed without the name helper grant';
end $$;
reset role;

set local role authenticated;
do $$
begin
  begin
    perform id from public.clinics;
  exception when insufficient_privilege then
    return;
  end;
  raise exception 'Authenticated role unexpectedly has clinic SELECT';
end $$;
reset role;
