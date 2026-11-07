-- Run in Dashboard SQL Editor or with db query --remote=<verified-ref> --read-only.
-- This inspects only application-schema metadata; no business records or secrets.
select current_database() as database_name,
       current_user as database_role,
       current_setting('server_version') as server_version,
       (
         select coalesce(jsonb_agg(objects order by table_name), '[]'::jsonb)
         from (
           select table_schema, table_name, table_type
           from information_schema.tables
           where table_schema = 'public'
         ) as objects
       ) as public_objects;
