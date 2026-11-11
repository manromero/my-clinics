import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  checkParity,
  checkTypes,
  organization,
  verifyTarget,
} from "./database-validation.mjs";

test("validation credentials fail closed and stay out of diagnostics", () => {
  const script = fileURLToPath(
    new URL("./database-validation.mjs", import.meta.url),
  );
  const fakeScopedToken = `sbp_fc${"0".repeat(38)}`;
  const legacyToken = `sbp_${"0".repeat(40)}`;
  const malformedToken = "sbp_fc_invalid_test_token";
  const cases = [
    { token: undefined, message: /Set SUPABASE_ACCESS_TOKEN/ },
    { token: legacyToken, message: /must be a dedicated scoped Supabase PAT/ },
    { token: malformedToken, message: /valid CLI token format/ },
    {
      token: fakeScopedToken,
      status: 401,
      message: /Supabase rejected the validation token/,
    },
    {
      token: fakeScopedToken,
      status: 403,
      message: /check the validation token's organization scope/i,
    },
  ];
  for (const { token, status, message } of cases) {
    const stub = `globalThis.fetch = async (url, options) => {
      if (url !== ${JSON.stringify(`https://api.supabase.com/v1/organizations/${organization}`)} || options.method !== "GET" || !${status ?? false}) {
        throw new Error("Unexpected remote request");
      }
      return new Response(options.headers.Authorization, { status: ${status ?? 500} });
    };`;
    const env = {
      ...process.env,
      MYCLINICS_DISPOSABLE_AUTHORIZATION: organization,
    };
    delete env.SUPABASE_ACCESS_TOKEN;
    if (token) env.SUPABASE_ACCESS_TOKEN = token;
    const result = spawnSync(
      process.execPath,
      [
        `--import=data:text/javascript,${encodeURIComponent(stub)}`,
        script,
        "validate",
      ],
      { env, encoding: "utf8" },
    );
    assert.ifError(result.error);
    assert.equal(result.status, 1);
    assert.match(result.stderr, message);
    assert.equal(result.stdout, "");
    if (token)
      assert.ok(!result.stderr.includes(token), "Credential leaked to stderr");
  }
});

test("target guard rejects shared development, wrong organization and wrong name", () => {
  const name = "myclinics-validation-test";
  const project = {
    id: "abcdefghijklmnopqrst",
    name,
    organization_id: organization,
  };
  verifyTarget(project, name);
  assert.throws(() =>
    verifyTarget({ ...project, id: "lvqbrjybwstvdhaxyxyn" }, name),
  );
  assert.throws(() =>
    verifyTarget({ ...project, organization_id: "other" }, name),
  );
  assert.throws(() => verifyTarget({ ...project, name: "my-clinics" }, name));
});

test("freshness and parity fail on changed content without rewriting files", () => {
  checkTypes("generated", "generated");
  assert.throws(() => checkTypes("generated", "stale"));
  checkParity([{ name: "probe" }], [{ name: "probe" }]);
  assert.throws(() => checkParity([{ name: "probe" }], []));
});
