import assert from "node:assert/strict";

// Execute against the disposable replay target only. These are infrastructure
// fixtures, never production schemas, migrations, or application entities.
export async function catalogRegressions({ query, snapshot, checkParity }) {
  const baseline = await snapshot();
  try {
    await query(`create table public.validation_catalog_probe
      (obsolete integer, retained integer, also_retained text);
      alter table public.validation_catalog_probe drop column obsolete;`);
    const upgraded = await snapshot();
    await query(`drop table public.validation_catalog_probe;
      create table public.validation_catalog_probe (retained integer, also_retained text);`);
    checkParity(upgraded, await snapshot());
    console.log(
      "R2: dropped physical column gap equals declarative surviving column order",
    );

    await query(`drop table public.validation_catalog_probe;
      create table public.validation_catalog_probe (also_retained text, retained integer);`);
    const reordered = await snapshot();
    assert.throws(() => checkParity(upgraded, reordered));
    console.log("R2: actual surviving column reorder rejected");
    await query(
      "alter table public.validation_catalog_probe alter column retained type bigint",
    );
    const changed = await snapshot();
    assert.throws(() => checkParity(reordered, changed));
    console.log("R2: actual column type drift rejected");
  } finally {
    await query("drop table if exists public.validation_catalog_probe");
  }

  let ownerRoleCreated = false;
  const definitions = (catalog) =>
    catalog.filter(
      (object) =>
        object.kind === "type" &&
        ["validation_catalog_enum", "validation_catalog_domain"].includes(
          object.name,
        ),
    );
  const createTypes = `create type public.validation_catalog_enum as enum ('synthetic');
    create domain public.validation_catalog_domain as text collate pg_catalog."C";`;
  const dropTypes = `drop type if exists public.validation_catalog_enum;
    drop domain if exists public.validation_catalog_domain;`;
  try {
    await query(createTypes);
    const original = definitions(await snapshot());
    assert.equal(original.length, 2);
    assert.equal(
      original.find((object) => object.name === "validation_catalog_domain")
        .definition.collation.name,
      "C",
    );
    assert.equal(
      original.find((object) => object.name === "validation_catalog_domain")
        .definition.collation.schema,
      "pg_catalog",
    );
    assert.equal(
      original.find((object) => object.name === "validation_catalog_enum")
        .definition.owner,
      "postgres",
    );
    await query(`${dropTypes}\n${createTypes}`);
    checkParity(original, definitions(await snapshot()));
    console.log(
      "R3: recreated enum/domain with equal owner and collation compare equal",
    );

    await query("create role validation_catalog_owner nologin");
    ownerRoleCreated = true;
    await query(`grant validation_catalog_owner to postgres;
      grant create on schema public to validation_catalog_owner;
      alter type public.validation_catalog_enum owner to validation_catalog_owner;
      alter domain public.validation_catalog_domain owner to validation_catalog_owner;`);
    const ownerChanged = definitions(await snapshot());
    for (const object of original) {
      const current = ownerChanged.find((item) => item.name === object.name);
      assert.equal(current.definition.owner, "validation_catalog_owner");
      assert.throws(() => checkParity(object, current));
      checkParity(object, {
        ...current,
        definition: { ...current.definition, owner: object.definition.owner },
      });
    }
    console.log("R3: enum and domain owner-only changes rejected");
    await query(`alter type public.validation_catalog_enum owner to postgres;
      alter domain public.validation_catalog_domain owner to postgres;`);
    checkParity(original, definitions(await snapshot()));

    await query(`drop domain public.validation_catalog_domain;
      create domain public.validation_catalog_domain as text collate pg_catalog."POSIX";`);
    const collationChanged = definitions(await snapshot());
    const before = original.find(
      (object) => object.name === "validation_catalog_domain",
    );
    const after = collationChanged.find(
      (object) => object.name === "validation_catalog_domain",
    );
    assert.equal(after.definition.collation.name, "POSIX");
    assert.throws(() => checkParity(before, after));
    checkParity(before, {
      ...after,
      definition: {
        ...after.definition,
        collation: before.definition.collation,
      },
    });
    console.log(
      "R3: domain collation-only change rejected by normalized schema/name",
    );
  } finally {
    await query(dropTypes);
    if (ownerRoleCreated) {
      await query(`revoke all on schema public from validation_catalog_owner;
        drop role validation_catalog_owner;`);
    }
  }
  checkParity(baseline, await snapshot());
  console.log(
    "Catalog regression fixtures and role removed; baseline parity restored",
  );
}
