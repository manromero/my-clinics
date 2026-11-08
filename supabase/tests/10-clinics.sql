-- Each failure assertion also checks the stable identifier for domain mapping.
create function pg_temp.reject_clinic_write(statement text, expected_state text, expected_constraint text default null)
returns void language plpgsql as $$
declare actual_constraint text;
begin
  begin
    execute statement;
  exception when others then
    get stacked diagnostics actual_constraint = constraint_name;
    if sqlstate <> expected_state or
      (expected_constraint is not null and actual_constraint <> expected_constraint) then
      raise exception 'Unexpected rejection: % / %', sqlstate, actual_constraint;
    end if;
    return;
  end;
  raise exception 'Invalid clinic write accepted: %', statement;
end $$;

do $$
declare clinic_id uuid; value text; whitespace text;
begin
  insert into public.clinics (name, percentage) values ('Validation Clinic', 12.34) returning id into clinic_id;
  if clinic_id is null or not (select active from public.clinics where id=clinic_id) then
    raise exception 'UUID/active default missing';
  end if;
  update public.clinics set name='Validation Clinic', active=false, percentage=100 where id=clinic_id;
  update public.clinics set name=E'\tVALIDATION CLINIC\n', active=true, percentage=0 where id=clinic_id;
  if not exists (select 1 from public.clinics where id=clinic_id and active and percentage=0) then
    raise exception 'Unchanged-name edit, identity or reactivation failed';
  end if;
  perform pg_temp.reject_clinic_write($s$insert into public.clinics(name,percentage) values (' validation clinic ',20)$s$, '23505', 'clinics_name_key_unique');
  insert into public.clinics(name,percentage) values ('Other validation clinic',50);
  perform pg_temp.reject_clinic_write($s$update public.clinics set name=' validation CLINIC ' where name='Other validation clinic'$s$, '23505', 'clinics_name_key_unique');
  foreach whitespace in array array['', ' ', E'\t\r\n', U&'\00A0\2003\FEFF'] loop
    perform pg_temp.reject_clinic_write(format('insert into public.clinics(name,percentage) values (%L,20)',whitespace), '23514', 'clinics_name_nonblank');
    perform pg_temp.reject_clinic_write(format('update public.clinics set name=%L where id=%L',whitespace,clinic_id), '23514', 'clinics_name_nonblank');
  end loop;
  perform pg_temp.reject_clinic_write(format('insert into public.clinics(name,percentage) values (%L,20)',U&'\00A0Validation Clinic\3000'), '23505', 'clinics_name_key_unique');
  insert into public.clinics(name,percentage) values ('Clínica Validación',50);
  perform pg_temp.reject_clinic_write($s$insert into public.clinics(name,percentage) values (' CLÍNICA VALIDACIÓN ',20)$s$, '23505', 'clinics_name_key_unique');
  foreach value in array array['-0.01','100.01','100.001','-0.001', '''NaN''','''Infinity''','''-Infinity'''] loop
    perform pg_temp.reject_clinic_write(format('insert into public.clinics(name,percentage) values (''Invalid range'',%s)',value), '23514');
    perform pg_temp.reject_clinic_write(format('update public.clinics set percentage=%s where id=%L',value,clinic_id), '23514');
  end loop;
  foreach value in array array['0.001','99.999','12.345','0.00000000000000000001'] loop
    perform pg_temp.reject_clinic_write(format('insert into public.clinics(name,percentage) values (''Invalid precision'',%s)',value), '23514', 'clinics_percentage_precision');
    perform pg_temp.reject_clinic_write(format('update public.clinics set percentage=%s where id=%L',value,clinic_id), '23514', 'clinics_percentage_precision');
  end loop;
  foreach value in array array['0','100','0.01','99.99','12.3400'] loop
    execute format('update public.clinics set percentage=%s where id=%L',value,clinic_id);
    if (select percentage from public.clinics where id=clinic_id) <> value::numeric then
      raise exception 'Exact percentage lost';
    end if;
  end loop;
  perform pg_temp.reject_clinic_write($s$insert into public.clinics(name,percentage) values (null,20)$s$, '23502');
  perform pg_temp.reject_clinic_write($s$insert into public.clinics(name,percentage) values ('Null percentage',null)$s$, '23502');
  perform pg_temp.reject_clinic_write($s$insert into public.clinics(name,percentage,active) values ('Null active',20,null)$s$, '23502');
end $$;
