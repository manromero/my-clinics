-- Temporary anonymous access for synthetic development data. Task 09 replaces it.
alter table public.clinics enable row level security;

revoke all on table public.clinics from public, anon, authenticated, service_role;
revoke all on sequence public.clinics_id_seq from public, anon, authenticated, service_role;
revoke execute on function public.clinic_name_key(text) from public, anon, authenticated, service_role;

grant select, delete on table public.clinics to anon;
grant insert (name, percentage, active), update (name, percentage, active)
  on table public.clinics to anon;
-- The name constraint and index call this pure normalization function on writes.
grant execute on function public.clinic_name_key(text) to anon;

create policy clinics_development_read on public.clinics
  for select to anon using (true);
create policy clinics_development_insert on public.clinics
  for insert to anon with check (true);
create policy clinics_development_update on public.clinics
  for update to anon using (true) with check (true);
create policy clinics_development_delete on public.clinics
  for delete to anon using (true);
