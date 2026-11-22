-- A referenced clinic must continue to belong to the owner of its activity.
alter table public.clinics add constraint clinics_owner_id_id_key unique (owner_id, id);

create table public.activity (
  id bigint generated always as identity primary key,
  owner_id uuid not null,
  clinic_id bigint not null,
  activity_date date not null,
  description text,
  price numeric not null,
  calculation_mode text not null,
  direct_amount numeric,
  applied_percentage numeric not null,
  applied_irpf numeric not null,
  -- Store rates as percentages. NUMERIC round moves signed ties away from zero.
  gross numeric generated always as (
    round(coalesce(direct_amount, price * (applied_percentage * 0.01)), 2)
  ) stored,
  -- A generated column cannot reference another generated column.
  net numeric generated always as (
    round(round(coalesce(direct_amount, price * (applied_percentage * 0.01)), 2)
      * (1 - applied_irpf * 0.01), 2)
  ) stored,
  constraint activity_clinic_owner_fkey foreign key (owner_id, clinic_id)
    references public.clinics (owner_id, id) on delete restrict,
  constraint activity_date_range check (activity_date between date '0001-01-01' and date '9999-12-31'),
  -- An unconstrained numeric preserves input scale for these checks.
  -- Reserve 19 of PostgreSQL's 131072 integer digits for a bigint row count.
  -- Rates from 0 to 100 and rounding to cents cannot increase a cent-aligned
  -- input's magnitude, so this also bounds gross and net.
  constraint activity_price_amount check (
    abs(price) < 1e131053 and scale(price) <= 2
  ),
  constraint activity_direct_amount check (
    abs(direct_amount) < 1e131053 and scale(direct_amount) <= 2
  ),
  constraint activity_calculation_mode check (
    (calculation_mode = 'percentage' and direct_amount is null)
    or (calculation_mode = 'direct' and direct_amount is not null)
  ),
  constraint activity_percentage_rate check (applied_percentage between 0 and 100 and applied_percentage = trunc(applied_percentage, 2)),
  constraint activity_irpf_rate check (applied_irpf between 0 and 100 and applied_irpf = trunc(applied_irpf, 2))
);

-- Identity supplies the immutable creation order when calendar dates tie.
create index activity_owner_date_idx on public.activity (owner_id, activity_date desc, id);
create index activity_owner_clinic_date_idx on public.activity (owner_id, clinic_id, activity_date desc, id);

alter table public.activity enable row level security;
create policy activity_owner_read on public.activity
  for select to authenticated using (owner_id = (select auth.uid()));

revoke all on table public.activity from public, anon, authenticated, service_role;
revoke all on sequence public.activity_id_seq from public, anon, authenticated, service_role;
grant select (id, clinic_id, activity_date, description, price, calculation_mode,
  direct_amount, applied_percentage, applied_irpf, gross, net) on public.activity to authenticated;

create function public.parse_activity_amount(amount text)
returns numeric language plpgsql immutable strict
set search_path = pg_catalog
as $$
begin
  if amount !~ '^[+-]?[0-9]+([.][0-9]{1,2})?$' then
    raise exception 'Expected a signed decimal with up to two decimal places' using errcode = '22023';
  end if;
  -- Match the table bound before casting, even beyond numeric's native range.
  if length(split_part(ltrim(amount, '+-0'), '.', 1)) > 131053 then
    raise exception 'Activity amount exceeds the supported range' using errcode = '22003';
  end if;
  return amount::numeric;
end;
$$;

create function public.activity_clinic_percentage(clinic bigint, owner uuid)
returns numeric language plpgsql
set search_path = pg_catalog
as $$
declare
  percentage numeric;
begin
  -- Share locks let different activity writes use the same clinic concurrently,
  -- while serializing the eligibility and rate read with clinic updates.
  select c.percentage into percentage from public.clinics c
  where c.id = clinic and c.owner_id = owner and c.active
  for share;
  if not found then
    raise exception 'Clinic is unavailable' using errcode = '42501';
  end if;
  return percentage;
end;
$$;

create function public.create_activity(
  p_clinic_id text, p_activity_date date, p_description text,
  p_price text, p_calculation_mode text, p_direct_amount text
)
returns text language plpgsql security definer
set search_path = pg_catalog
as $$
declare
  caller uuid := auth.uid();
  clinic bigint := p_clinic_id::bigint;
  new_id bigint;
  percentage numeric;
begin
  if caller is null then
    raise exception 'Activity requires an authenticated owner' using errcode = '42501';
  end if;
  percentage := public.activity_clinic_percentage(clinic, caller);
  insert into public.activity (
    owner_id, clinic_id, activity_date, description, price, calculation_mode,
    direct_amount, applied_percentage, applied_irpf
  ) values (
    caller, clinic, p_activity_date, p_description, public.parse_activity_amount(p_price),
    p_calculation_mode, public.parse_activity_amount(p_direct_amount), percentage, 15
  ) returning id into new_id;
  return new_id::text;
end;
$$;

create function public.update_activity(
  p_id text, p_clinic_id text, p_activity_date date, p_description text,
  p_price text, p_calculation_mode text, p_direct_amount text
)
returns text language plpgsql security definer
set search_path = pg_catalog
as $$
declare
  caller uuid := auth.uid();
  clinic bigint := p_clinic_id::bigint;
  previous public.activity%rowtype;
  percentage numeric;
begin
  select a.* into previous from public.activity a
  where a.id = p_id::bigint and a.owner_id = caller
  for update;
  if not found then
    raise exception 'Activity is unavailable' using errcode = '42501';
  end if;
  percentage := previous.applied_percentage;
  if clinic is distinct from previous.clinic_id then
    percentage := public.activity_clinic_percentage(clinic, caller);
  end if;
  update public.activity set
    clinic_id = clinic,
    activity_date = p_activity_date,
    description = p_description,
    price = public.parse_activity_amount(p_price),
    calculation_mode = p_calculation_mode,
    direct_amount = public.parse_activity_amount(p_direct_amount),
    applied_percentage = percentage
  where id = previous.id;
  return previous.id::text;
end;
$$;

create function public.delete_activity(p_id text)
returns text language plpgsql security definer
set search_path = pg_catalog
as $$
declare
  removed_id bigint;
begin
  delete from public.activity where id = p_id::bigint and owner_id = auth.uid()
  returning id into removed_id;
  if not found then
    raise exception 'Activity is unavailable' using errcode = '42501';
  end if;
  return removed_id::text;
end;
$$;

-- A single invoker result contains all totals and cannot lose clinic groups
-- to an API response row limit. A half-open range matches monthly list reads.
-- Exact amounts, counts and IDs cross the Data API as text.
create function public.activity_period_totals(
  p_start date, p_end date, p_clinic_id text default null
)
returns table (price text, gross text, net text, row_count text, clinics jsonb)
language sql stable
set search_path = pg_catalog
as $$
  with totals as (
    select a.clinic_id, grouping(a.clinic_id) as is_overall,
      coalesce(sum(a.price), 0)::text as price,
      coalesce(sum(a.gross), 0)::text as gross,
      coalesce(sum(a.net), 0)::text as net,
      count(*)::text as row_count
    from public.activity a
    where a.activity_date >= p_start and a.activity_date < p_end
      and (p_clinic_id is null or a.clinic_id = p_clinic_id::bigint)
    group by grouping sets ((), (a.clinic_id))
  )
  select overall.price, overall.gross, overall.net, overall.row_count,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'clinic_id', clinic.clinic_id::text, 'price', clinic.price,
        'gross', clinic.gross, 'net', clinic.net, 'row_count', clinic.row_count
      ) order by clinic.clinic_id)
      from totals clinic where clinic.is_overall = 0
    ), '[]'::jsonb)
  from totals overall where overall.is_overall = 1;
$$;

revoke execute on function
  public.parse_activity_amount(text),
  public.activity_clinic_percentage(bigint, uuid),
  public.create_activity(text, date, text, text, text, text),
  public.update_activity(text, text, date, text, text, text, text),
  public.delete_activity(text),
  public.activity_period_totals(date, date, text)
from public, anon, authenticated, service_role;

grant execute on function
  public.create_activity(text, date, text, text, text, text),
  public.update_activity(text, text, date, text, text, text, text),
  public.delete_activity(text),
  public.activity_period_totals(date, date, text)
to authenticated;
