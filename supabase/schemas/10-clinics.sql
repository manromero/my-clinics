-- Match ECMAScript String.trim whitespace; internal whitespace remains significant.
create function public.clinic_name_key(value text)
returns text language sql immutable strict parallel safe
set search_path = pg_catalog
as $$
  select lower(btrim(value, U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF'));
$$;

create table public.clinics (
  id bigint generated always as identity constraint clinics_pkey primary key,
  name text not null,
  -- No numeric(p,s): a typmod would round before CHECK constraints see input.
  percentage numeric not null,
  active boolean default true not null,
  constraint clinics_name_nonblank check (public.clinic_name_key(name) <> ''),
  constraint clinics_name_length check (char_length(name) <= 200),
  constraint clinics_percentage_range check (percentage >= 0 and percentage <= 100),
  constraint clinics_percentage_precision check (percentage = trunc(percentage, 2))
);

create unique index clinics_name_key_unique
  on public.clinics (public.clinic_name_key(name));
