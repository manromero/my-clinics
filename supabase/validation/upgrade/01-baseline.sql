-- Test-only infrastructure, never a production migration or business entity.
create schema validation_fixture;
create table validation_fixture.probe (id integer primary key, payload text not null);
