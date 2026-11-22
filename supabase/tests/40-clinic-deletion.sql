insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000051'),
  ('00000000-0000-4000-8000-000000000052');

insert into public.clinics (id, owner_id, name, percentage, active) overriding system value values
  (9007199254740993, '00000000-0000-4000-8000-000000000051', 'Former activity clinic', 20, true),
  (9007199254740994, '00000000-0000-4000-8000-000000000051', 'Empty active clinic', 30, true),
  (9007199254740995, '00000000-0000-4000-8000-000000000051', 'Empty inactive clinic', 40, false),
  (9007199254740996, null, 'Unassigned clinic', 50, true);

do $$
begin
  if has_function_privilege('anon', 'public.delete_clinic(text)', 'EXECUTE')
    or has_function_privilege('service_role', 'public.delete_clinic(text)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.delete_clinic(text)', 'EXECUTE')
    or has_table_privilege('authenticated', 'public.clinics', 'DELETE') then
    raise exception 'Unexpected clinic deletion privileges';
  end if;
end $$;

create function pg_temp.expect_clinic_delete_error(clinic text, code text, explanation text)
returns void language plpgsql as $$
begin
  begin
    perform public.delete_clinic(clinic);
  exception when others then
    if sqlstate = code and sqlerrm = explanation then return; end if;
    raise exception 'Unexpected clinic deletion error (%): %', sqlstate, sqlerrm;
  end;
  raise exception 'Unexpectedly deleted clinic %', clinic;
end $$;

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000051","role":"authenticated"}';
select public.create_activity('9007199254740993', '2026-01-01', 'Zero', '0', 'percentage', null);
select public.create_activity('9007199254740993', '2026-02-01', 'Negative', '-1', 'percentage', null);

set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000052","role":"authenticated"}';
select pg_temp.expect_clinic_delete_error('9007199254740993', '42501', 'Clinic is unavailable');
select pg_temp.expect_clinic_delete_error('9007199254740994', '42501', 'Clinic is unavailable');
select pg_temp.expect_clinic_delete_error('9007199254740996', '42501', 'Clinic is unavailable');
select pg_temp.expect_clinic_delete_error('9007199254740997', '42501', 'Clinic is unavailable');
set local request.jwt.claims = '{}';
select pg_temp.expect_clinic_delete_error('9007199254740993', '42501', 'Clinic is unavailable');

set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000051","role":"authenticated"}';
select pg_temp.expect_clinic_delete_error('9007199254740993', '23503', 'Clinic has saved activity');
update public.clinics set active = false where id = 9007199254740993;
do $$
begin
  if not exists (select id from public.clinics where id = 9007199254740993 and not active)
    or (select array_agg(price order by activity_date) from public.activity) is distinct from array[0, -1]::numeric[] then
    raise exception 'Blocked deletion failed to preserve the clinic and both activity rows';
  end if;
  if public.delete_clinic('9007199254740994') is distinct from '9007199254740994'
    or public.delete_clinic('9007199254740995') is distinct from '9007199254740995' then
    raise exception 'Could not delete the active or inactive empty clinic';
  end if;
end $$;

select public.delete_activity((select id::text from public.activity where price = 0));
select pg_temp.expect_clinic_delete_error('9007199254740993', '23503', 'Clinic has saved activity');
select public.delete_activity((select id::text from public.activity where price = -1));
do $$
begin
  if public.delete_clinic('9007199254740993') is distinct from '9007199254740993' then
    raise exception 'Could not delete clinic after its last activity row was removed';
  end if;
  if exists (select id from public.clinics) or exists (select id from public.activity) then
    raise exception 'The owner should have no clinics or activity';
  end if;
end $$;
reset role;
