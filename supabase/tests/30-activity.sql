insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000031'),
  ('00000000-0000-4000-8000-000000000032');

insert into public.clinics (id, owner_id, name, percentage, active) overriding system value values
  (9007199254740993, '00000000-0000-4000-8000-000000000031', 'Activity clinic A', 10, true),
  (-32, '00000000-0000-4000-8000-000000000031', 'Activity clinic A2', 40, true),
  (-33, '00000000-0000-4000-8000-000000000032', 'Activity clinic B', 70, true),
  (-34, null, 'Unassigned activity clinic', 50, true);

create function pg_temp.expect_activity_error(statement text, expected_state text default '42501')
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

do $$
declare role_name text;
begin
  if not (select relrowsecurity from pg_class where oid = 'public.activity'::regclass)
    or has_table_privilege('authenticated', 'public.activity', 'INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
    or has_any_column_privilege('authenticated', 'public.activity', 'INSERT, UPDATE, REFERENCES')
    or has_column_privilege('authenticated', 'public.activity', 'owner_id', 'SELECT')
    or has_function_privilege('authenticated', 'public.activity_clinic_percentage(bigint,uuid)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.parse_activity_amount(text)', 'EXECUTE') then
    raise exception 'Unexpected authenticated privilege';
  end if;
  foreach role_name in array array['anon', 'authenticated', 'service_role'] loop
    if has_sequence_privilege(role_name, 'public.activity_id_seq', 'USAGE, SELECT, UPDATE') then
      raise exception 'Unexpected direct access to activity sequence for %', role_name;
    end if;
  end loop;
  foreach role_name in array array['anon', 'service_role'] loop
    if has_table_privilege(role_name, 'public.activity', 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
      or has_any_column_privilege(role_name, 'public.activity', 'SELECT, INSERT, UPDATE, REFERENCES')
      or has_function_privilege(role_name, 'public.create_activity(text,date,text,text,text,text)', 'EXECUTE')
      or has_function_privilege(role_name, 'public.update_activity(text,text,date,text,text,text,text)', 'EXECUTE')
      or has_function_privilege(role_name, 'public.delete_activity(text)', 'EXECUTE')
      or has_function_privilege(role_name, 'public.activity_period_totals(date,date,text)', 'EXECUTE') then
      raise exception 'Unexpected activity access for %', role_name;
    end if;
  end loop;
end $$;

set local role anon;
select pg_temp.expect_activity_error('select id from public.activity');
select pg_temp.expect_activity_error($s$select public.create_activity('-32', '2026-01-01', null, '1', 'percentage', null)$s$);
select pg_temp.expect_activity_error($s$select public.update_activity('1', '-32', '2026-01-01', null, '1', 'percentage', null)$s$);
select pg_temp.expect_activity_error($s$select public.delete_activity('1')$s$);
select pg_temp.expect_activity_error($s$select * from public.activity_period_totals('2026-01-01', '2026-02-01')$s$);
reset role;

set local role authenticated;
do $$
begin
  if exists (select id from public.activity) then
    raise exception 'Authenticated role without a subject saw activity';
  end if;
end $$;
select pg_temp.expect_activity_error($s$select public.create_activity('-32', '2026-01-01', null, '1', 'percentage', null)$s$);

set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000032","role":"authenticated"}';
select set_config('validation.activity_b', public.create_activity(
  '-33', '2026-01-01', null, '100', 'percentage', null
), true);

set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000031","role":"authenticated"}';
select pg_temp.expect_activity_error($s$select public.create_activity('-33', '2026-01-01', null, '1', 'percentage', null)$s$);
select pg_temp.expect_activity_error($s$select public.create_activity('-34', '2026-01-01', null, '1', 'percentage', null)$s$);
select pg_temp.expect_activity_error($s$select public.update_activity(
  current_setting('validation.activity_b'), '-32', '2026-01-01', null, '1', 'percentage', null)$s$);
select pg_temp.expect_activity_error($s$select public.delete_activity(current_setting('validation.activity_b'))$s$);
select pg_temp.expect_activity_error('insert into public.activity default values');
select pg_temp.expect_activity_error('update public.activity set applied_irpf = 0');
select pg_temp.expect_activity_error('update public.activity set applied_percentage = 100');
select pg_temp.expect_activity_error('update public.activity set gross = default, net = default');
select pg_temp.expect_activity_error('update public.activity set owner_id = auth.uid()');
select pg_temp.expect_activity_error('update public.activity set id = default');
select pg_temp.expect_activity_error('delete from public.activity');
select pg_temp.expect_activity_error($s$select public.create_activity(
  '-32', '2026-01-01', null, '1', 'percentage', null, p_owner_id => auth.uid())$s$, '42883');
select pg_temp.expect_activity_error($s$select public.create_activity(
  '-32', '2026-01-01', null, '1', 'percentage', null, p_applied_percentage => 100)$s$, '42883');

do $$
declare amount text;
begin
  foreach amount in array array['NaN', 'Infinity', '-Infinity', '1e2', '1,00', '1.001', '1.000', '1.', ' 1', '', 'abc'] loop
    perform pg_temp.expect_activity_error(format(
      'select public.create_activity(''-32'', ''2026-01-01'', null, %L, ''percentage'', null)', amount
    ), '22023');
    perform pg_temp.expect_activity_error(format(
      'select public.create_activity(''-32'', ''2026-01-01'', null, ''1'', ''direct'', %L)', amount
    ), '22023');
  end loop;
end $$;
select pg_temp.expect_activity_error($s$select public.create_activity('-32', '2026-01-01', null, null, 'percentage', null)$s$, '23502');
select pg_temp.expect_activity_error($s$select public.create_activity('-32', '2026-01-01', null, '1', 'unknown', null)$s$, '23514');
select pg_temp.expect_activity_error($s$select public.create_activity('-32', '2026-01-01', null, '1', 'direct', null)$s$, '23514');
select pg_temp.expect_activity_error($s$select public.create_activity('-32', '2026-01-01', null, '1', 'percentage', '0')$s$, '23514');
select pg_temp.expect_activity_error($s$select public.create_activity('-32', 'infinity', null, '1', 'percentage', null)$s$, '23514');

do $$
declare percentage_id text;
declare direct_id text;
declare zero_id text;
declare positive_id text;
declare large_id text;
begin
  if exists (select id from public.activity) then
    raise exception 'Owner A saw owner B activity';
  end if;
  percentage_id := public.create_activity('9007199254740993', '2026-01-01', null, '-0.05', 'percentage', null);
  perform set_config('validation.activity_a', percentage_id, true);
  direct_id := public.create_activity('-32', '2026-01-01', 'Refund', '-25.01', 'direct', '-0.10');
  zero_id := public.create_activity('-32', '2026-01-01', null, '0', 'direct', '0');
  positive_id := public.create_activity('9007199254740993', '2026-01-01', null, '0.05', 'percentage', null);
  large_id := public.create_activity('-32', '2026-02-01', null, '9007199254740993.01', 'direct', '0.10');
  if not exists (select id from public.activity where id::text = percentage_id
    and clinic_id::text = '9007199254740993' and applied_percentage = 10 and applied_irpf = 15
    and description is null and gross = -0.01 and net = -0.01) then
    raise exception 'Negative percentage half-cent or initial snapshots incorrect';
  end if;
  if not exists (select id from public.activity where id::text = direct_id
    and price = -25.01 and direct_amount = -0.10 and gross = -0.10 and net = -0.09) then
    raise exception 'Negative direct half-cent or original price incorrect';
  end if;
  if not exists (select id from public.activity where id::text = positive_id and gross = 0.01 and net = 0.01)
    or not exists (select id from public.activity where id::text = zero_id and price = 0 and gross = 0 and net = 0)
    or not exists (select id from public.activity where id::text = large_id and price::text = '9007199254740993.01'
      and gross = 0.10 and net = 0.09) then
    raise exception 'Positive half-cent, explicit zero or exact large amount incorrect';
  end if;
  if (select array_agg(id::text order by activity_date desc, id) from public.activity)
    is distinct from array[large_id, percentage_id, direct_id, zero_id, positive_id] then
    raise exception 'Unexpected owner visibility or stable activity order';
  end if;
  if not exists (
    select 1 from public.activity_period_totals('2026-01-01', '2026-02-01')
    where price::numeric = -25.01 and gross::numeric = -0.10 and net::numeric = -0.09
      and row_count = '4' and jsonb_array_length(clinics) = 2
      and clinics @> '[{"clinic_id":"9007199254740993","row_count":"2"}]'
  ) then raise exception 'Signed period totals, clinic groups or date bounds incorrect'; end if;
  if not exists (
    select 1 from public.activity_period_totals('2026-01-01', '2026-02-01', '-32')
    where price::numeric = -25.01 and gross::numeric = -0.10 and net::numeric = -0.09
      and row_count = '2' and jsonb_array_length(clinics) = 1
  ) or not exists (
    select 1 from public.activity_period_totals('2026-01-01', '2026-02-01', '-33')
    where price = '0' and gross = '0' and net = '0' and row_count = '0' and clinics = '[]'
  ) then raise exception 'Clinic filter or empty totals exposed the wrong rows'; end if;
end $$;

update public.clinics set percentage = 75, active = false where id = 9007199254740993;
select pg_temp.expect_activity_error($s$select public.create_activity(
  '9007199254740993', '2026-01-02', null, '1', 'percentage', null)$s$);
select pg_temp.expect_activity_error($s$select public.update_activity(
  current_setting('validation.activity_a'), '-33', '2026-01-02', null, '1', 'percentage', null)$s$);
select pg_temp.expect_activity_error($s$select public.update_activity(
  current_setting('validation.activity_a'), '9007199254740993', '2026-01-02', null, '1.001', 'percentage', null)$s$, '22023');
do $$
declare saved_id text := current_setting('validation.activity_a');
begin
  if public.update_activity(saved_id, '9007199254740993', '2026-01-02', 'Revised', '4', 'percentage', null)
    is distinct from saved_id then raise exception 'Update changed identity'; end if;
  if not exists (select id from public.activity where id::text = saved_id and activity_date = '2026-01-02'
    and description = 'Revised' and applied_percentage = 10 and applied_irpf = 15
    and gross = 0.40 and net = 0.34) then
    raise exception 'Editing at an inactive clinic did not retain and use both snapshots';
  end if;
end $$;
reset role;

-- The operator path must still obey stored invariants and the owner/clinic key.
select pg_temp.expect_activity_error($s$delete from public.clinics where id = 9007199254740993$s$, '23503');
select pg_temp.expect_activity_error($s$update public.activity set clinic_id = -33
  where id::text = current_setting('validation.activity_a')$s$, '23503');
select pg_temp.expect_activity_error($s$update public.activity set price = 'NaN'
  where id::text = current_setting('validation.activity_a')$s$, '23514');
select pg_temp.expect_activity_error($s$update public.activity set price = 1.000
  where id::text = current_setting('validation.activity_a')$s$, '23514');
select pg_temp.expect_activity_error($s$update public.activity set gross = 100
  where id::text = current_setting('validation.activity_a')$s$, '428C9');

-- Simulate a saved withholding rate other than today's default.
update public.activity set applied_irpf = 20 where id::text = current_setting('validation.activity_a');
insert into public.activity (owner_id, clinic_id, activity_date, price, calculation_mode, applied_percentage, applied_irpf)
  select '00000000-0000-4000-8000-000000000031', -32, '2026-03-01', 0.05, 'percentage', 10, 15
  from generate_series(1, 1101);

set local role authenticated;
do $$
declare saved_id text := current_setting('validation.activity_a');
declare direct_id text;
begin
  perform public.update_activity(saved_id, '-32', '2026-01-02', null, '4', 'percentage', null);
  if not exists (select id from public.activity where id::text = saved_id and clinic_id = -32
    and applied_percentage = 40 and applied_irpf = 20 and gross = 1.60 and net = 1.28) then
    raise exception 'Reassignment did not change only the clinic rate snapshot';
  end if;
  perform pg_temp.expect_activity_error(format(
    'select public.update_activity(%L, ''9007199254740993'', ''2026-01-02'', null, ''4'', ''percentage'', null)', saved_id
  ));
  update public.clinics set active = true where id = 9007199254740993;
  select id::text into strict direct_id from public.activity where description = 'Refund';
  perform public.update_activity(direct_id, '9007199254740993', '2026-01-01', 'Refund', '-25.01', 'direct', '-0.10');
  if not exists (select id from public.activity where id::text = direct_id and applied_percentage = 75
    and calculation_mode = 'direct' and direct_amount = -0.10 and gross = -0.10 and net = -0.09) then
    raise exception 'Direct reassignment did not preserve direct calculation';
  end if;
  if public.delete_activity(saved_id) is distinct from saved_id then
    raise exception 'Owner delete returned the wrong ID';
  end if;
  if exists (select id from public.activity where id::text = saved_id) then
    raise exception 'Owner could not delete their activity';
  end if;
  if not exists (
    select 1 from public.activity_period_totals('2026-03-01', '2026-04-01')
    where price::numeric = 55.05 and gross::numeric = 11.01 and net::numeric = 11.01
      and row_count = '1101'
  ) then raise exception 'Totals did not include all rows beyond a response page'; end if;
end $$;

set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000032","role":"authenticated"}';
do $$
begin
  if (select array_agg(id::text) from public.activity)
    is distinct from array[current_setting('validation.activity_b')] then
    raise exception 'Owner B activity was modified or owner A activity was visible';
  end if;
end $$;
reset role;
