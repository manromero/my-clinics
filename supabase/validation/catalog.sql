-- Semantic application catalog, independent of OIDs and project identifiers.
-- Extension-owned objects belong to the hosted platform, not this application.
-- Fail closed for object kinds this catalog does not yet normalize.
do $$
begin
  if exists (
    select 1 from pg_depend d
    where d.refclassid='pg_namespace'::regclass
      and d.refobjid='public'::regnamespace
      and d.classid not in ('pg_class'::regclass,'pg_proc'::regclass,
        'pg_type'::regclass,'pg_constraint'::regclass,'pg_default_acl'::regclass)
      and not exists (select 1 from pg_depend e where e.classid=d.classid
                      and e.objid=d.objid and e.deptype='e')
  ) or exists (
    select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
    where n.nspname='public' and (t.typtype in ('r','m') or
      (t.typtype='c' and exists (select 1 from pg_class c where c.oid=t.typrelid and c.relkind='c')))
      and not exists (select 1 from pg_depend d where d.classid='pg_type'::regclass and d.objid=t.oid and d.deptype='e')
  ) or exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prokind in ('a','w')
      and not exists (select 1 from pg_depend d where d.classid='pg_proc'::regclass and d.objid=p.oid and d.deptype='e')
  ) or exists (
    select 1 from pg_operator o join pg_namespace n on n.oid=o.oprnamespace
    where n.nspname='public'
      and not exists (select 1 from pg_depend d where d.classid='pg_operator'::regclass and d.objid=o.oid and d.deptype='e')
  ) or exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and (c.relkind in ('p','f') or c.relispartition)
  ) then
    raise exception 'Unsupported public object kind: extend catalog reconciliation before use';
  end if;
end $$;
with relations as (
  select c.oid, c.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity,
         c.relpersistence, c.relreplident, c.reloptions, c.relacl,
         pg_get_userbyid(c.relowner) as owner
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r','p','v','m','S','f')
    and not exists (select 1 from pg_depend d where d.classid = 'pg_class'::regclass
                    and d.objid = c.oid and d.deptype = 'e')
), objects as (
  select 'relation' as kind, relname as name,
    jsonb_build_object('kind', relkind, 'rls', relrowsecurity,
      'force_rls', relforcerowsecurity, 'options', reloptions,
      'acl', relacl, 'owner', owner, 'persistence', relpersistence,
      'replica_identity', relreplident) as definition from relations
  union all
  select 'column', c.relname || '.' || a.attname,
    jsonb_build_object('position', row_number() over (partition by c.oid order by a.attnum),
      'type', format_type(a.atttypid,a.atttypmod),
      'nullable', not a.attnotnull, 'default', pg_get_expr(d.adbin,d.adrelid),
      'identity', a.attidentity, 'generated', a.attgenerated,
      'collation', co.collname, 'acl', a.attacl)
  from relations c join pg_attribute a on a.attrelid=c.oid
    left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum
    left join pg_collation co on co.oid=a.attcollation
  where a.attnum > 0 and not a.attisdropped
  union all
  select 'constraint', c.relname || '.' || x.conname,
    to_jsonb(pg_get_constraintdef(x.oid, false))
  from relations c join pg_constraint x on x.conrelid=c.oid
  union all
  select 'index', c.relname || '.' || i.relname, to_jsonb(pg_get_indexdef(i.oid))
  from relations c join pg_index x on x.indrelid=c.oid join pg_class i on i.oid=x.indexrelid
  union all
  select 'view', relname, to_jsonb(pg_get_viewdef(oid, false))
  from relations where relkind in ('v','m')
  union all
  select 'sequence', c.relname,
    jsonb_build_object('type',format_type(s.seqtypid,null),'start',s.seqstart,
      'increment',s.seqincrement,'max',s.seqmax,'min',s.seqmin,
      'cache',s.seqcache,'cycle',s.seqcycle,
      'owned_by',(select r.relname || '.' || a.attname
        from pg_depend d join pg_class r on r.oid=d.refobjid
        join pg_attribute a on a.attrelid=r.oid and a.attnum=d.refobjsubid
        where d.classid='pg_class'::regclass and d.objid=c.oid
          and d.refclassid='pg_class'::regclass and d.deptype in ('a','i')))
  from relations c join pg_sequence s on s.seqrelid=c.oid
  union all
  select 'trigger', c.relname || '.' || t.tgname,
    jsonb_build_object('definition',pg_get_triggerdef(t.oid,false),'enabled',t.tgenabled)
  from relations c join pg_trigger t on t.tgrelid=c.oid where not t.tgisinternal
  union all
  select 'policy', tablename || '.' || policyname,
    to_jsonb(p) - 'schemaname' - 'tablename' - 'policyname'
  from pg_policies p where schemaname='public'
  union all
  select 'routine', p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
    jsonb_build_object('definition',pg_get_functiondef(p.oid),'acl',p.proacl,
      'owner',pg_get_userbyid(p.proowner))
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.prokind in ('f','p')
    and not exists (select 1 from pg_depend d where d.classid='pg_proc'::regclass
                    and d.objid=p.oid and d.deptype='e')
  union all
  select 'type', t.typname,
    jsonb_build_object('kind',t.typtype,'base',format_type(t.typbasetype,t.typtypmod),
      'notnull',t.typnotnull,'default',t.typdefault,'acl',t.typacl,
      'owner',pg_get_userbyid(t.typowner),
      'collation',(select jsonb_build_object('schema',cn.nspname,'name',co.collname)
        from pg_collation co join pg_namespace cn on cn.oid=co.collnamespace
        where co.oid=t.typcollation),
      'labels',(select jsonb_agg(e.enumlabel order by e.enumsortorder) from pg_enum e where e.enumtypid=t.oid),
      'constraints',(select jsonb_agg(pg_get_constraintdef(x.oid,false) order by x.conname) from pg_constraint x where x.contypid=t.oid))
  from pg_type t join pg_namespace n on n.oid=t.typnamespace
  where n.nspname='public' and t.typtype in ('e','d')
    and not exists (select 1 from pg_depend d where d.classid='pg_type'::regclass
                    and d.objid=t.oid and d.deptype='e')
  union all
  select 'default_acl', pg_get_userbyid(a.defaclrole) || ':' || a.defaclobjtype::text,
    to_jsonb(a.defaclacl)
  from pg_default_acl a where a.defaclnamespace='public'::regnamespace
  union all
  select 'schema', n.nspname, jsonb_build_object('owner',pg_get_userbyid(n.nspowner),'acl',n.nspacl)
  from pg_namespace n where n.nspname='public'
)
select coalesce(jsonb_agg(jsonb_build_object('kind',kind,'name',name,'definition',definition)
  order by kind,name), '[]'::jsonb) as catalog from objects;
