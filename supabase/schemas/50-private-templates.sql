-- Application-owned lifecycle. Storage's platform tables remain untouched.
alter table public.clinics add column template_revision bigint not null default 1;
grant select (template_revision) on public.clinics to authenticated;

create function public.advance_template_revision()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  new.template_revision := old.template_revision + 1;
  return new;
end;
$$;
revoke execute on function public.advance_template_revision() from public, anon, authenticated, service_role;
create trigger clinics_template_revision before update on public.clinics
for each row execute function public.advance_template_revision();

create table public.template_save_requests (
  id uuid primary key,
  owner_id uuid not null references auth.users(id),
  -- Retain the request and outcome even when a clinic is later deleted.
  payload jsonb not null,
  mode text not null check (mode in ('keep', 'replace', 'remove')),
  state text not null check (state in ('pending', 'validating', 'ready', 'saved', 'retired', 'cancelled')),
  expected_sha256 text,
  expected_bytes integer,
  original_filename text,
  sha256 text,
  byte_count integer,
  validator_version text,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  lease_id uuid,
  lease_until timestamptz,
  outcome jsonb,
  created_at timestamptz not null default now(),
  retired_at timestamptz,
  constraint template_request_identity unique(owner_id, id),
  constraint template_expected_bytes check (
    (mode='replace' and expected_bytes is not null and expected_sha256 is not null
      and expected_bytes between 1 and 10000000 and expected_sha256 ~ '^[a-f0-9]{64}$')
    or (mode<>'replace' and expected_bytes is null and expected_sha256 is null)
  ),
  constraint template_validated_bytes check (
    (sha256 is null and byte_count is null and validator_version is null)
    or (mode='replace' and sha256=expected_sha256 and byte_count=expected_bytes and validator_version is not null)
  ),
  constraint template_filename_length check (char_length(original_filename)<=512)
);
create index template_requests_cleanup on public.template_save_requests(state, expires_at);
alter table public.template_save_requests enable row level security;
revoke all on public.template_save_requests from public, anon, authenticated, service_role;
grant select(id, mode, state, original_filename, sha256, byte_count, validator_version, outcome, created_at)
  on public.template_save_requests to authenticated;
create policy template_requests_owner_read on public.template_save_requests
for select to authenticated using(owner_id=(select auth.uid()));

create table public.clinic_templates (
  clinic_id bigint primary key,
  owner_id uuid not null,
  template_id uuid not null unique,
  constraint clinic_template_owner foreign key(owner_id,clinic_id)
    references public.clinics(owner_id,id) on delete cascade,
  constraint clinic_template_request_owner foreign key(owner_id,template_id)
    references public.template_save_requests(owner_id,id)
);
alter table public.clinic_templates enable row level security;
revoke all on public.clinic_templates from public, anon, authenticated, service_role;
grant select(clinic_id, template_id) on public.clinic_templates to authenticated;
create policy clinic_templates_owner_read on public.clinic_templates
for select to authenticated using(owner_id=(select auth.uid()));

create function public.retire_clinic_template()
returns trigger language plpgsql security definer set search_path = pg_catalog as $$
begin
  update public.template_save_requests set state='retired',retired_at=now()
    where id=old.template_id and state='saved';
  return old;
end;
$$;
revoke execute on function public.retire_clinic_template() from public, anon, authenticated, service_role;
create trigger clinic_templates_retire after delete on public.clinic_templates
for each row execute function public.retire_clinic_template();

create function public.begin_template_save(p_owner uuid,p_id uuid,p_clinic text,p_revision text,
  p_name text,p_percentage numeric,p_active boolean,p_mode text,p_filename text,p_sha256 text,p_bytes integer)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare r public.template_save_requests; v_payload jsonb; v_name text;
begin
  -- Serialize per-owner reservation admission, including concurrent requests.
  perform pg_advisory_xact_lock(hashtextextended(p_owner::text,0));
  if p_owner is null or p_id is null or p_mode not in ('keep','replace','remove') or p_mode is null
    or p_active is null or p_percentage is null or p_percentage not between 0 and 100
    or p_percentage<>trunc(p_percentage,2) or p_name is null or char_length(p_name)>200
    or public.clinic_name_key(p_name)='' then
    raise exception 'Invalid template save fields' using errcode='22023';
  end if;
  v_name := btrim(p_name,U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF');
  if p_clinic is not null then
    perform 1 from public.clinics where id=p_clinic::bigint and owner_id=p_owner;
    if not found then raise exception 'Clinic unavailable' using errcode='42501'; end if;
    if p_revision is null then raise exception 'Revision required' using errcode='22023'; end if;
  elsif p_revision is not null or not p_active then
    raise exception 'New clinic must start active' using errcode='22023';
  end if;
  v_payload:=jsonb_build_object('clinic',p_clinic,'revision',p_revision,'name',v_name,
    'percentage',p_percentage,'active',p_active,'mode',p_mode,'filename',p_filename,'sha256',p_sha256,'bytes',p_bytes);
  if not exists(select 1 from public.template_save_requests where id=p_id)
    and (select count(*) from public.template_save_requests where owner_id=p_owner
      and state in ('pending','validating','ready') and expires_at>now())>=10 then
    raise exception 'Too many pending template saves' using errcode='54000';
  end if;
  insert into public.template_save_requests(id,owner_id,payload,mode,state,expected_sha256,expected_bytes,original_filename)
  values(p_id,p_owner,v_payload,p_mode,case when p_mode='replace' then 'pending' else 'ready' end,p_sha256,p_bytes,p_filename)
  on conflict(id) do nothing;
  select * into r from public.template_save_requests where id=p_id for update;
  if r.owner_id<>p_owner then raise exception 'Request unavailable' using errcode='42501'; end if;
  if r.payload<>v_payload then raise exception 'Request identity reused' using errcode='22023'; end if;
  return to_jsonb(r);
end;
$$;

create function public.template_request(p_owner uuid,p_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare r public.template_save_requests;
begin
  select * into r from public.template_save_requests where id=p_id and owner_id=p_owner;
  if not found then raise exception 'Request unavailable' using errcode='42501'; end if;
  return to_jsonb(r);
end;
$$;

create function public.claim_template_validation(p_owner uuid,p_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare r public.template_save_requests;
begin
  select * into r from public.template_save_requests where id=p_id and owner_id=p_owner for update;
  if not found then raise exception 'Request unavailable' using errcode='42501'; end if;
  if r.state in ('ready','saved') then return to_jsonb(r); end if;
  if r.mode<>'replace' or r.state not in ('pending','validating') or r.expires_at<=now() then
    raise exception 'Request not validatable' using errcode='55000';
  end if;
  if r.state='validating' and r.lease_until>now() then
    raise exception 'Validation in progress' using errcode='55P03';
  end if;
  update public.template_save_requests set state='validating',lease_id=gen_random_uuid(),lease_until=now()+interval '2 minutes'
    where id=p_id returning * into r;
  return to_jsonb(r);
end;
$$;

create function public.finish_template_validation(p_owner uuid,p_id uuid,p_lease uuid,p_sha256 text,p_bytes integer,p_validator text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare r public.template_save_requests;
begin
  select * into r from public.template_save_requests where id=p_id and owner_id=p_owner for update;
  if not found then raise exception 'Request unavailable' using errcode='42501'; end if;
  if r.state<>'validating' or r.lease_id is distinct from p_lease or r.lease_until<=now() or r.expires_at<=now() then
    raise exception 'Validation lease lost' using errcode='55000';
  end if;
  if p_sha256 is distinct from r.expected_sha256 or p_bytes is distinct from r.expected_bytes
    or p_validator is null or length(p_validator)>100 then
    raise exception 'Validation identity mismatch' using errcode='22023';
  end if;
  update public.template_save_requests set state='ready',sha256=p_sha256,byte_count=p_bytes,validator_version=p_validator,
    lease_id=null,lease_until=null where id=p_id returning * into r;
  return to_jsonb(r);
end;
$$;

create function public.cancel_template_save(p_owner uuid,p_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare r public.template_save_requests;
begin
  select * into r from public.template_save_requests where id=p_id and owner_id=p_owner for update;
  if not found then raise exception 'Request unavailable' using errcode='42501'; end if;
  if r.outcome is not null then return to_jsonb(r); end if;
  if r.state in ('pending','validating','ready') then
    update public.template_save_requests set state='cancelled',lease_id=null,lease_until=null where id=p_id returning * into r;
  end if;
  return to_jsonb(r);
end;
$$;

create function public.commit_template_save(p_owner uuid,p_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare r public.template_save_requests; c public.clinics; target bigint; previous uuid;
begin
  select * into r from public.template_save_requests where id=p_id and owner_id=p_owner for update;
  if not found then raise exception 'Request unavailable' using errcode='42501'; end if;
  if r.outcome is not null then return r.outcome; end if;
  if r.state<>'ready' or r.expires_at<=now() or (r.mode='replace' and r.sha256 is null) then
    raise exception 'Request not publishable' using errcode='55000';
  end if;
  if r.payload->>'clinic' is null then
    insert into public.clinics(owner_id,name,percentage) values(p_owner,r.payload->>'name',(r.payload->>'percentage')::numeric)
      returning * into c;
  else
    select * into c from public.clinics where id=(r.payload->>'clinic')::bigint and owner_id=p_owner for update;
    if not found then raise exception 'Clinic unavailable' using errcode='42501'; end if;
    if c.template_revision::text<>r.payload->>'revision' then
      raise exception 'Clinic changed' using errcode='PT409';
    end if;
    update public.clinics set name=r.payload->>'name',percentage=(r.payload->>'percentage')::numeric,
      active=(r.payload->>'active')::boolean where id=c.id returning * into c;
  end if;
  target:=c.id;
  if r.mode in ('replace','remove') then
    select template_id into previous from public.clinic_templates where clinic_id=target;
    delete from public.clinic_templates where clinic_id=target;
  end if;
  if r.mode='replace' then
    insert into public.clinic_templates(clinic_id,owner_id,template_id) values(target,p_owner,p_id);
  end if;
  update public.template_save_requests set state='saved',outcome=jsonb_build_object('clinicId',target::text,
    'revision',c.template_revision::text,'retiredTemplateId',previous::text,'templateId',(select template_id::text from public.clinic_templates where clinic_id=target))
    where id=p_id returning * into r;
  return r.outcome;
end;
$$;

create function public.read_clinic_template(p_owner uuid,p_clinic text,p_template uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare r public.template_save_requests;
begin
  select r0.* into r from public.clinic_templates t join public.clinics c on c.id=t.clinic_id
    join public.template_save_requests r0 on r0.id=t.template_id
    where c.id=p_clinic::bigint and c.owner_id=p_owner and t.owner_id=p_owner
      and t.template_id=p_template and r0.state='saved' and r0.sha256 is not null;
  if not found then raise exception 'Template unavailable' using errcode='42501'; end if;
  return to_jsonb(r);
end;
$$;

-- The request row serializes cancellation/expiry with validation and publication.
-- Retrying the same operation may delete its affected terminal object again.
create function public.claim_template_cleanup(p_owner uuid,p_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare r public.template_save_requests;
begin
  select * into r from public.template_save_requests where id=p_id and owner_id=p_owner for update;
  if not found or r.mode<>'replace' or exists(select 1 from public.clinic_templates where template_id=p_id) then
    raise exception 'Object is not collectible' using errcode='55000';
  end if;
  if r.state in ('retired','cancelled') then return to_jsonb(r); end if;
  if r.state in ('pending','validating','ready') and r.expires_at<=now() then
    update public.template_save_requests set state='cancelled',lease_id=null,lease_until=null
      where id=p_id returning * into r;
    return to_jsonb(r);
  end if;
  raise exception 'Object is not collectible' using errcode='55000';
end;
$$;

-- Only the trusted server can attest validation or publish. Never grant these
-- routines to authenticated, even when wrapping them in an application action.
revoke execute on function public.begin_template_save(uuid,uuid,text,text,text,numeric,boolean,text,text,text,integer),
  public.template_request(uuid,uuid), public.claim_template_validation(uuid,uuid),
  public.finish_template_validation(uuid,uuid,uuid,text,integer,text), public.cancel_template_save(uuid,uuid),
  public.commit_template_save(uuid,uuid), public.read_clinic_template(uuid,text,uuid),
  public.claim_template_cleanup(uuid,uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.begin_template_save(uuid,uuid,text,text,text,numeric,boolean,text,text,text,integer),
  public.template_request(uuid,uuid), public.claim_template_validation(uuid,uuid),
  public.finish_template_validation(uuid,uuid,uuid,text,integer,text), public.cancel_template_save(uuid,uuid),
  public.commit_template_save(uuid,uuid), public.read_clinic_template(uuid,text,uuid),
  public.claim_template_cleanup(uuid,uuid) to service_role;
