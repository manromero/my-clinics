import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import { catalogRegressions } from "./database-catalog-regressions.mjs";
import {
  clinicConcurrencyTests,
  clinicNegativeControls,
  clinicSeedTests,
} from "./clinic-database-validation.mjs";

export const organization = "njnmfutclorywskqrftd";
const protectedRef = "lvqbrjybwstvdhaxyxyn";
const root = fileURLToPath(new URL("../", import.meta.url));
const typesPath = new URL(
  "../src/lib/supabase/database.types.ts",
  import.meta.url,
);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const literal = (value) => `'${value.replaceAll("'", "''")}'`;

export function checkTypes(actual, expected) {
  assert.equal(
    actual,
    expected,
    "Generated Database types are stale; run pnpm db:types on a fresh replay",
  );
}

export function checkParity(actual, expected) {
  assert.deepEqual(
    actual,
    expected,
    "Declarative schema and migration history differ",
  );
}

async function sqlFiles(folder) {
  return (await readdir(new URL(`../${folder}/`, import.meta.url)))
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

async function api(path, method = "GET", body) {
  const response = await fetch(`https://api.supabase.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });
  // Never emit response bodies: management responses can contain credentials.
  if (!response.ok) {
    const sqlState = path.endsWith("/database/query")
      ? (await response.text()).match(/ERROR:\s+([A-Z0-9]{5}):/)?.[1]
      : undefined;
    const error = new Error(
      `Management API ${method} ${path}: HTTP ${response.status}${sqlState ? ` SQLSTATE ${sqlState}` : ""}`,
    );
    error.status = response.status;
    error.sqlState = sqlState;
    throw error;
  }
  return response.status === 204 ? undefined : response.json();
}

export function verifyTarget(project, name) {
  assert.match(project.id, /^[a-z]{20}$/);
  assert.notEqual(
    project.id,
    protectedRef,
    "Shared development target is prohibited",
  );
  assert.equal(project.name, name);
  assert.equal(project.organization_id, organization);
  assert.ok(name.startsWith("myclinics-validation-"));
}

const owned = new Map();
async function query(ref, sql) {
  assert.ok(owned.has(ref), "SQL requires a target created by this process");
  const config = await api(`/projects/${ref}/postgrest`);
  assert.ok(
    ["", "pg_pgrst_no_exposed_schemas"].includes(config.db_schema),
    "Data API must be disabled before SQL",
  );
  return api(`/projects/${ref}/database/query`, "POST", { query: sql });
}

async function disposable(label, run) {
  const name = `myclinics-validation-${label}-${randomBytes(5).toString("hex")}`;
  const password = randomBytes(32).toString("base64url");
  const project = await api("/projects", "POST", {
    name,
    organization_slug: organization,
    region: "eu-central-1",
    db_pass: password,
  });
  const ref = project.id ?? project.ref;
  // Register immediately so provisioning/configuration failures still clean up.
  assert.match(ref, /^[a-z]{20}$/);
  assert.notEqual(ref, protectedRef);
  owned.set(ref, name);
  console.log(`Created ${name} (${ref})`);
  try {
    let healthy = false;
    for (let attempt = 0; attempt < 120; attempt++) {
      const current = await api(`/projects/${ref}`);
      verifyTarget(current, name);
      if (current.status === "ACTIVE_HEALTHY") {
        healthy = true;
        break;
      }
      await pause(5000);
    }
    assert.ok(healthy, `Provisioning timed out: ${ref}`);
    await api(`/projects/${ref}/postgrest`, "PATCH", { db_schema: "" });
    console.log(`Verified disposable identity; disabling Data API: ${ref}`);
    return await run(ref, password);
  } finally {
    const current = await api(`/projects/${ref}`);
    verifyTarget(current, name);
    await api(`/projects/${ref}`, "DELETE");
    const projects = await api("/projects");
    assert.ok(
      !projects.some((item) => item.id === ref),
      `Cleanup not confirmed: ${ref}`,
    );
    owned.delete(ref);
    console.log(`Deleted and verified absent: ${ref}`);
  }
}

async function snapshot(ref) {
  const sql = await readFile(
    new URL("../supabase/validation/catalog.sql", import.meta.url),
    "utf8",
  );
  const rows = await query(ref, sql);
  assert.equal(rows.length, 1);
  return rows[0].catalog;
}

async function replay(ref, files = undefined) {
  await query(
    ref,
    `create schema if not exists supabase_migrations;
    create table if not exists supabase_migrations.schema_migrations
    (version text primary key, statements text[], name text);`,
  );
  for (const name of files ?? (await sqlFiles("supabase/migrations"))) {
    assert.match(name, /^\d{14}_[a-z0-9_]+\.sql$/, "Invalid migration name");
    const sql = await readFile(
      new URL(`../supabase/migrations/${name}`, import.meta.url),
      "utf8",
    );
    const [version] = name.split("_");
    await query(
      ref,
      `begin;\n${sql}\n;
      insert into supabase_migrations.schema_migrations(version, name, statements)
      values (${literal(version)}, ${literal(name.slice(15, -4))}, array[${literal(sql)}]); commit;`,
    );
    console.log(`Replayed ${name}`);
  }
  console.log("Clean migration replay passed");
}

async function clinicUpgrade(ref) {
  const files = await sqlFiles("supabase/migrations");
  const clinicMigration = "20261108090000_create_clinics.sql";
  const position = files.indexOf(clinicMigration);
  assert.ok(position >= 0, "Clinic migration must exist");
  await replay(ref, files.slice(0, position));
  // The previous public baseline was empty: no pre-existing clinics are possible.
  // Commit synthetic data in a separate schema before applying the real migration.
  await query(
    ref,
    `create schema validation_preclinic;
    create table validation_preclinic.existing_data(id uuid primary key,payload text not null);
    insert into validation_preclinic.existing_data values
      ('00000000-0000-4000-8000-000000000099','synthetic-before-clinic-migration');`,
  );
  const before = await query(
    ref,
    "select * from validation_preclinic.existing_data",
  );
  await replay(ref, files.slice(position));
  assert.deepEqual(
    await query(ref, "select * from validation_preclinic.existing_data"),
    before,
  );
  assert.deepEqual(
    await query(ref, "select count(*)::integer as count from public.clinics"),
    [{ count: 0 }],
  );
  await query(ref, "drop schema validation_preclinic cascade");
  console.log(
    "Actual clinic migration upgrade from previous empty baseline preserved committed synthetic data",
  );
  return snapshot(ref);
}

async function generateTypes(ref) {
  const raw = execFileSync(
    process.execPath,
    [
      `${root}node_modules/supabase/dist/supabase.js`,
      "gen",
      "types",
      "--lang=typescript",
      "--schema=public",
      `--remote=${ref}`,
    ],
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  assert.ok(
    raw.includes("export type Database"),
    "CLI did not return Database types",
  );
  return format(raw, { parser: "typescript" });
}

async function databaseTests(ref) {
  const files = await sqlFiles("supabase/tests");
  assert.ok(files.length, "At least one database test is required");
  for (const name of files) {
    await query(
      ref,
      `begin;\n${await readFile(new URL(`../supabase/tests/${name}`, import.meta.url), "utf8")}\n; rollback;`,
    );
    console.log(`Database test passed: ${name}`);
  }
}

async function upgrade(ref) {
  for (const name of [
    "01-baseline.sql",
    "02-seed.sql",
    "03-upgrade.sql",
    "04-assert.sql",
  ]) {
    await query(
      ref,
      await readFile(
        new URL(`../supabase/validation/upgrade/${name}`, import.meta.url),
        "utf8",
      ),
    );
  }
  await query(ref, "drop schema validation_fixture cascade");
  console.log(
    "Upgrade preserved pre-existing synthetic rows without reset; fixture removed",
  );
}

async function negativeControls(ref, baseline, generated) {
  await assert.rejects(
    query(ref, "create table public.invalid_migration ("),
    (error) => error.status === 400,
  );
  console.log("Negative migration control rejected invalid SQL");
  await query(ref, "create table public.validation_schema_drift (id integer)");
  try {
    const drift = await snapshot(ref);
    assert.throws(() => checkParity(drift, baseline));
  } finally {
    await query(ref, "drop table public.validation_schema_drift");
  }
  checkParity(await snapshot(ref), baseline);
  assert.throws(() =>
    checkTypes(generated, `${generated}// deliberate stale types\n`),
  );
  console.log("Negative schema/type controls rejected drift; recovery passed");
}

export async function main(mode = process.argv[2]) {
  assert.ok(
    ["validate", "types", "clinics"].includes(mode),
    "Use validate, types or clinics",
  );
  assert.ok(
    process.env.SUPABASE_ACCESS_TOKEN,
    "Set SUPABASE_ACCESS_TOKEN in the shell or .env.database-validation",
  );
  assert.equal(
    process.env.MYCLINICS_DISPOSABLE_AUTHORIZATION,
    organization,
    "Explicit disposable-target authorization is required",
  );
  const caFile = process.env.MYCLINICS_SUPABASE_CA_FILE;
  if (mode === "clinics") {
    assert.ok(caFile, "Set MYCLINICS_SUPABASE_CA_FILE to the Supabase root CA");
    assert.match(
      await readFile(caFile, "utf8"),
      /^-----BEGIN CERTIFICATE-----\r?\n/,
      "Supabase root CA must be a PEM certificate",
    );
  }
  const org = await api(`/organizations/${organization}`);
  assert.equal(
    org.plan,
    "free",
    "Only the verified Free plan is authorized; no paid upgrades",
  );
  const projects = await api("/projects");
  assert.ok(
    projects.filter((item) => item.status !== "INACTIVE").length < 2,
    "No free project capacity; never delete an existing project",
  );
  console.log("Verified Free plan and one sequential disposable project slot");
  if (mode === "clinics") {
    await disposable("clinics", async (ref, password) => {
      await replay(ref);
      const { validatePersistentClinics } =
        await import("./persistent-clinics-validation.mjs");
      let poolers;
      try {
        poolers = await api(`/projects/${ref}/config/database/pooler`);
      } catch (error) {
        if (error.status !== 403) throw error;
        const project = await api(`/projects/${ref}`);
        assert.equal(project.database.host, `db.${ref}.supabase.co`);
        console.log(
          "Pooler metadata read permission unavailable; testing project-reported direct PostgreSQL host",
        );
        poolers = [
          {
            database_type: "PRIMARY",
            connection_string: `postgresql://postgres@${project.database.host}:5432/postgres`,
          },
        ];
      }
      await validatePersistentClinics({
        ref,
        password,
        poolers,
        caFile: resolve(caFile),
        query: (sql) => query(ref, sql),
      });
    });
    console.log(
      "Persistent clinics integration passed; disposable target cleaned up",
    );
    return;
  }
  const result = await disposable("replay", async (ref) => {
    await replay(ref);
    const catalog = await snapshot(ref);
    const generated = await generateTypes(ref);
    checkTypes(await generateTypes(ref), generated);
    if (mode === "validate") {
      checkTypes(generated, await readFile(typesPath, "utf8"));
      await clinicSeedTests(
        (sql) => query(ref, sql),
        await readFile(
          new URL("../supabase/seed.sql", import.meta.url),
          "utf8",
        ),
      );
      await databaseTests(ref);
      await clinicConcurrencyTests((sql) => query(ref, sql));
      await clinicNegativeControls(
        (sql) => query(ref, sql),
        await readFile(
          new URL("../supabase/tests/10-clinics.sql", import.meta.url),
          "utf8",
        ),
      );
      checkParity(await snapshot(ref), catalog);
      await upgrade(ref);
      await negativeControls(ref, catalog, generated);
      await catalogRegressions({
        query: (sql) => query(ref, sql),
        snapshot: () => snapshot(ref),
        checkParity,
      });
    }
    return { catalog, generated };
  });
  if (mode === "validate") {
    await disposable("upgrade", async (ref) => {
      checkParity(result.catalog, await clinicUpgrade(ref));
      console.log("Actual upgrade catalog matches clean replay");
    });
  }
  await disposable("desired", async (ref) => {
    for (const name of await sqlFiles("supabase/schemas")) {
      await query(
        ref,
        await readFile(
          new URL(`../supabase/schemas/${name}`, import.meta.url),
          "utf8",
        ),
      );
    }
    checkParity(result.catalog, await snapshot(ref));
    console.log("Remote declarative/history catalog parity passed");
  });
  if (mode === "types") {
    await writeFile(typesPath, result.generated);
    console.log(
      "Updated generated Database types after clean replay and parity",
    );
  }
  console.log(`Database ${mode} passed; all disposable targets cleaned up`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    // SQL/CLI error messages may contain environment values. Keep logs redacted.
    console.error(
      error instanceof assert.AssertionError ||
        error.message.startsWith("Management API ")
        ? error.message.split("\n")[0]
        : `Database validation failed (${error.name}); inspect stage logs and disposable cleanup`,
    );
    process.exitCode = 1;
  });
}
