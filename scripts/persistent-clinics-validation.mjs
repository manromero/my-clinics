import assert from "node:assert/strict";
import postgres from "postgres";
import { spawn, execFileSync } from "node:child_process";
import { readFile, readdir, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromeClinicChecks } from "./persistent-clinics-visuals.mjs";

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function validatePersistentClinics({
  ref,
  password,
  poolers,
  caFile,
  query,
}) {
  // Use the platform-provided host rather than guessing a pooler from region.
  const pooler = poolers.find(
    (item) => item.database_type === "PRIMARY" && item.connection_string,
  );
  assert.ok(pooler, "Primary pooler configuration unavailable");
  const connection = new URL(pooler.connection_string);
  const pooled = connection.hostname.endsWith(".pooler.supabase.com");
  assert.ok(pooled || connection.hostname === `db.${ref}.supabase.co`);
  assert.equal(
    decodeURIComponent(connection.username),
    pooled ? `postgres.${ref}` : "postgres",
  );
  connection.password = password;
  connection.port = "5432"; // Direct PostgreSQL or IPv4 session pooling.
  connection.searchParams.set("sslrootcert", caFile);
  const probe = postgres(connection.toString(), {
    ssl: "verify-full",
    prepare: false,
    max: 1,
    connect_timeout: 10,
  });
  try {
    for (let attempt = 0; attempt < 7; attempt++) {
      try {
        const [result] = await probe`select 1 as connected`;
        assert.equal(result.connected, 1);
        console.log(
          `Verified PostgreSQL connectivity with certificate and hostname checks (${pooled ? "session pooler" : "direct"})`,
        );
        break;
      } catch (error) {
        const code = /^[A-Z_0-9]+$/.test(error.code ?? "")
          ? error.code
          : "CONNECTION_FAILED";
        if (
          attempt < 6 &&
          ["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED"].includes(code)
        ) {
          console.log(`PostgreSQL provisioning/network retry (${code})`);
          await pause(5000);
          continue;
        }
        assert.fail(`PostgreSQL connectivity unavailable (${code})`);
      }
    }
  } finally {
    await probe.end({ timeout: 1 });
  }
  const output =
    process.env.MYCLINICS_EVIDENCE_DIR ??
    join(tmpdir(), `myclinics-task06-${Date.now()}`);
  await mkdir(output, { recursive: true });
  const server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3106",
    ],
    {
      env: { ...process.env, MYCLINICS_DATABASE_URL: connection.toString() },
      stdio: "ignore",
    },
  );
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try {
        if ((await fetch("http://127.0.0.1:3106/clinics")).ok) {
          ready = true;
          break;
        }
      } catch {}
      await pause(300);
    }
    assert.ok(ready, "Production Next server unavailable");
    const seed = await readFile("supabase/seed.sql", "utf8");
    await query(seed);
    await query(
      "insert into public.clinics(id,name,percentage,active) overriding system value values(9007199254740993,'Clínica Sintética ID exacto',27.5,true)",
    );
    const list = async () => {
      const response = await fetch("http://127.0.0.1:3106/api/clinics");
      return { status: response.status, body: await response.json() };
    };
    const loaded = await list();
    assert.equal(
      loaded.status,
      200,
      "Actual server-only PostgreSQL connection failed",
    );
    assert.equal(loaded.body.status, "loaded");
    assert.deepEqual(
      loaded.body.clinics.map((c) => [c.id, c.percentage, c.active]),
      [
        ["1", 0, true],
        ["2", 100, false],
        ["3", 37.25, true],
        ["9007199254740993", 27.5, true],
      ],
    );
    assert.deepEqual(
      await list(),
      loaded,
      "Reload must preserve database state",
    );
    for (const method of ["POST", "PATCH", "DELETE"]) {
      assert.equal(
        (await fetch("http://127.0.0.1:3106/api/clinics", { method })).status,
        405,
      );
    }
    console.log(
      `Actual PostgreSQL listing verified with TLS; exact bigint ID, saved reload and unsupported writes passed (${ref})`,
    );
    async function inspect(folder) {
      for (const item of await readdir(folder, { withFileTypes: true })) {
        const path = join(folder, item.name);
        if (item.isDirectory()) await inspect(path);
        else if (item.name.endsWith(".js")) {
          const content = await readFile(path, "utf8");
          assert.ok(
            !content.includes(password),
            "Credential reached browser bundle",
          );
          for (const forbidden of [
            "MYCLINICS_DATABASE_URL",
            "select id::text",
            "pooler.supabase.com",
            "SUPABASE_ACCESS_TOKEN",
          ])
            assert.ok(
              !content.includes(forbidden),
              "Server infrastructure reached browser bundle",
            );
        }
      }
    }
    try {
      await inspect(".next/static");
    } catch (error) {
      if (error instanceof assert.AssertionError) throw error;
      const code = /^[A-Z0-9_]+$/.test(error.code ?? "")
        ? error.code
        : "UNKNOWN";
      assert.fail(`Production browser bundle inspection failed (${code})`);
    }
    console.log(
      "Production browser bundles contain no connection secret, SQL, or privileged setup",
    );
    await chromeClinicChecks({
      output,
      query,
      seed,
      head: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
    });
  } finally {
    server.kill();
    await new Promise((resolve) => {
      if (server.exitCode !== null) resolve();
      else server.once("exit", resolve);
    });
  }
}
