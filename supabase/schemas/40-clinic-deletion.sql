create function public.delete_clinic(p_id text)
returns text language plpgsql security definer
set search_path = pg_catalog
as $$
declare
  removed_id bigint;
  blocking_constraint text;
begin
  delete from public.clinics
  where id = p_id::bigint and owner_id = auth.uid()
  returning id into removed_id;
  if not found then
    raise exception 'Clinic is unavailable' using errcode = '42501';
  end if;
  return removed_id::text;
exception when foreign_key_violation then
  get stacked diagnostics blocking_constraint = constraint_name;
  if blocking_constraint = 'activity_clinic_owner_fkey' then
    raise exception 'Clinic has saved activity' using errcode = '23503',
      constraint = 'activity_clinic_owner_fkey';
  end if;
  raise;
end;
$$;

revoke execute on function public.delete_clinic(text) from public, anon, authenticated, service_role;
grant execute on function public.delete_clinic(text) to authenticated;
