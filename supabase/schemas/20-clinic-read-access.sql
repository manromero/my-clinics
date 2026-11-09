alter table public.clinics enable row level security;

revoke all on table public.clinics from public, anon, authenticated, service_role;
revoke all on sequence public.clinics_id_seq from public, anon, authenticated, service_role;
revoke execute on function public.clinic_name_key(text) from public, anon, authenticated, service_role;
grant select on table public.clinics to authenticated;

create policy clinics_authorized_read on public.clinics
  for select to authenticated
  using (
    (select auth.uid()) is not null
    and (select auth.jwt())->'is_anonymous' = 'false'::jsonb
    and (select auth.jwt())->'app_metadata'->'myclinics_clinic_reader' = 'true'::jsonb
  );
