alter table validation_fixture.probe add column revision integer not null default 1;
update validation_fixture.probe set revision = 2;
