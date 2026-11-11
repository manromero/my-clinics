alter table public.clinics enable row level security;

revoke all on table public.clinics from public, anon, authenticated, service_role;
revoke all on sequence public.clinics_id_seq from public, anon, authenticated, service_role;
revoke execute on function public.clinic_name_key(text) from public, anon, authenticated, service_role;

grant select (id, name, percentage, active), insert (owner_id, name, percentage),
  update (name, percentage, active) on table public.clinics to authenticated;
-- The name constraint and index call this pure normalization function on writes.
grant execute on function public.clinic_name_key(text) to authenticated;

create policy clinics_owner_read on public.clinics
  for select to authenticated using (owner_id = (select auth.uid()));
create policy clinics_owner_insert on public.clinics
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy clinics_owner_update on public.clinics
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
