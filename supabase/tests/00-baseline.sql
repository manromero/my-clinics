-- Tests raise SQL exceptions, so failures propagate to the remote runner.
-- Extend this transaction-rolled-back suite when introducing business objects.
do $$
begin
  if not exists (select 1 from pg_namespace where nspname='public') then
    raise exception 'Application schema missing';
  end if;
  if exists (select 1 from pg_namespace where nspname='validation_fixture') then
    raise exception 'Upgrade fixture leaked into the application baseline';
  end if;
end $$;
