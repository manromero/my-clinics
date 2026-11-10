-- Validate existing rows without rewriting names. Overlong names abort the migration.
alter table public.clinics
  add constraint clinics_name_length check (char_length(name) <= 200);
