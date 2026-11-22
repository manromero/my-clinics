-- Deterministic synthetic examples, applied only to authorized disposable targets.
insert into public.clinics (id, name, percentage, active) overriding system value values
  (1, 'Clínica Sintética Cero', 0, true),
  (2, 'Clínica Sintética Cien', 100, false),
  (3, 'Clínica Sintética Decimal', 37.25, true)
on conflict (id) do update set
  name = excluded.name, percentage = excluded.percentage, active = excluded.active;
-- Explicit synthetic identities must not collide with subsequent generated IDs.
select setval(pg_get_serial_sequence('public.clinics','id'), (select max(id) from public.clinics));
