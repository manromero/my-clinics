do $$
begin
  if (select count(*) from validation_fixture.probe) <> 1 or not exists (
    select 1 from validation_fixture.probe
    where id=1 and payload='synthetic-before-upgrade' and revision=2
  ) then
    raise exception 'Upgrade lost synthetic baseline data or failed its expected change';
  end if;
end $$;
