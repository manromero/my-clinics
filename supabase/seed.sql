-- Deterministic synthetic examples, applied only to authorized disposable targets.
insert into public.clinics (id, name, percentage, active) values
  ('00000000-0000-4000-8000-000000000001', 'Clínica Sintética Cero', 0, true),
  ('00000000-0000-4000-8000-000000000002', 'Clínica Sintética Cien', 100, false),
  ('00000000-0000-4000-8000-000000000003', 'Clínica Sintética Decimal', 37.25, true)
on conflict (id) do update set
  name = excluded.name, percentage = excluded.percentage, active = excluded.active;
