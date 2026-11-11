drop policy clinics_development_read on public.clinics;
drop policy clinics_development_insert on public.clinics;
drop policy clinics_development_update on public.clinics;
drop policy clinics_development_delete on public.clinics;

revoke all on table public.clinics from public, anon, authenticated, service_role;
-- Table-level revocation does not clear the earlier column-level grants.
revoke insert (name, percentage, active), update (name, percentage, active)
  on table public.clinics from anon;
revoke all on sequence public.clinics_id_seq from public, anon, authenticated, service_role;
revoke execute on function public.clinic_name_key(text) from public, anon, authenticated, service_role;

-- Preserve all existing rows in place. NULL ownership matches no account.
alter table public.clinics
  add column owner_id uuid constraint clinics_owner_id_fkey references auth.users(id);

drop index public.clinics_name_key_unique;
create unique index clinics_name_key_unique
  on public.clinics (owner_id, public.clinic_name_key(name)) nulls not distinct;

grant select (id, name, percentage, active), insert (owner_id, name, percentage),
  update (name, percentage, active) on table public.clinics to authenticated;
grant execute on function public.clinic_name_key(text) to authenticated;

create policy clinics_owner_read on public.clinics
  for select to authenticated using (owner_id = (select auth.uid()));
create policy clinics_owner_insert on public.clinics
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy clinics_owner_update on public.clinics
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
