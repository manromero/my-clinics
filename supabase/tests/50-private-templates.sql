insert into auth.users(id) values('00000000-0000-4000-8000-000000005001'),('00000000-0000-4000-8000-000000005002');
insert into public.clinics(id,owner_id,name,percentage,active) overriding system value
values(-5001,'00000000-0000-4000-8000-000000005001','Inactive template SQL fixture',20,false);

create function pg_temp.template_denied(statement text, expected text default '42501')
returns void language plpgsql as $$
begin
  begin execute statement;
  exception when others then
    if sqlstate<>expected then raise exception 'Expected SQLSTATE %, got %',expected,sqlstate; end if;
    return;
  end;
  raise exception 'Expected rejection';
end;
$$;
select public.begin_template_save('00000000-0000-4000-8000-000000005001','00000000-0000-4000-8000-000000005011',
  '-5001','1','Inactive template SQL fixture',20,false,'replace','../../display.pdf',repeat('a',64),100);
select pg_temp.template_denied($s$select public.commit_template_save('00000000-0000-4000-8000-000000005001','00000000-0000-4000-8000-000000005011')$s$,'55000');
select pg_temp.template_denied($s$select public.begin_template_save('00000000-0000-4000-8000-000000005002','00000000-0000-4000-8000-000000005012','-5001','1','Forged',20,false,'keep',null,null,null)$s$);
select pg_temp.template_denied($s$select public.begin_template_save('00000000-0000-4000-8000-000000005001','00000000-0000-4000-8000-000000005011','-5001','1','Changed payload',20,false,'replace',null,repeat('a',64),100)$s$,'22023');

set local role anon;
select pg_temp.template_denied('select id from public.template_save_requests');
select pg_temp.template_denied('select clinic_id from public.clinic_templates');
reset role;
set local role authenticated;
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-000000005001","role":"authenticated"}';
do $$ begin
  if (select count(*) from public.template_save_requests)<>1 then raise exception 'Owner metadata unavailable'; end if;
end $$;


select pg_temp.template_denied($s$update public.template_save_requests set state='ready'$s$);
select pg_temp.template_denied($s$delete from public.template_save_requests$s$);
select pg_temp.template_denied($s$insert into public.clinic_templates values(-5001,'00000000-0000-4000-8000-000000005001','00000000-0000-4000-8000-000000005011')$s$);
select pg_temp.template_denied($s$select public.finish_template_validation('00000000-0000-4000-8000-000000005001','00000000-0000-4000-8000-000000005011','00000000-0000-4000-8000-000000005001',repeat('a',64),100,'forged')$s$);
select pg_temp.template_denied($s$select public.commit_template_save('00000000-0000-4000-8000-000000005001','00000000-0000-4000-8000-000000005011')$s$);
set local request.jwt.claims='{"sub":"00000000-0000-4000-8000-000000005002","role":"authenticated"}';
do $$ begin
  if exists(select id from public.template_save_requests) then raise exception 'Foreign metadata exposed'; end if;
end $$;
reset role;

-- Fresh replay has no client-upload policies: only server-minted file capabilities.
do $$ begin
 if exists(select 1 from pg_policies where schemaname='storage' and policyname like 'templates_%')
 then raise exception 'Unexpected client Storage policy'; end if;
end $$;

select pg_temp.template_denied($s$select public.claim_template_cleanup('00000000-0000-4000-8000-000000005001','00000000-0000-4000-8000-000000005011')$s$,'55000');
select public.cancel_template_save('00000000-0000-4000-8000-000000005001','00000000-0000-4000-8000-000000005011');
do $$ begin
 if (public.claim_template_cleanup('00000000-0000-4000-8000-000000005001','00000000-0000-4000-8000-000000005011')->>'state')<>'cancelled'
 then raise exception 'Cleanup must follow terminal state'; end if;
end $$;
