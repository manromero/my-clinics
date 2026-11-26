import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import {
  templateInfrastructure,
  templateBuckets,
  templateBucketOptions,
} from "../src/lib/templates/infrastructure.ts";

const [mode, ref] = process.argv.slice(2);
assert.ok(
  ["inspect", "configure", "collect"].includes(mode),
  "Use inspect|configure|collect REF",
);
assert.match(ref ?? "", /^[a-z]{20}$/);
assert.notEqual(
  ref,
  "xihkrkgrhupiwcsfjctp",
  "Production is outside this operator's scope",
);
const token = process.env.SUPABASE_ACCESS_TOKEN;
assert.ok(token, "Scoped Management API credential required");
async function management(path, method = "GET", body) {
  const response = await fetch(`https://api.supabase.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  assert.ok(response.ok, `Management ${method} ${path}: ${response.status}`);
  return response.json();
}
const project = await management(`/projects/${ref}`);
assert.equal(project.id, ref);
assert.equal(project.organization_id, "njnmfutclorywskqrftd");
assert.ok(
  (ref === "lvqbrjybwstvdhaxyxyn" && project.name === "my-clinics_dev") ||
    project.name.startsWith("myclinics-validation-"),
);
if (mode !== "inspect")
  assert.equal(
    process.env.MYCLINICS_TEMPLATE_CONFIG_AUTHORIZATION,
    ref,
    "Exact reviewed target authorization marker required",
  );
const keys = await management(`/projects/${ref}/api-keys?reveal=true`);
const secret = keys.find((key) => key.name === "service_role").api_key;
const url = `https://${ref}.supabase.co`,
  admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const policies = await management(`/projects/${ref}/database/query`, "POST", {
  query:
    "begin transaction read only; select policyname,qual,with_check from pg_policies where schemaname='storage' and tablename='objects' order by policyname; commit;",
});
assert.equal(
  policies.length,
  1,
  "Review unexpected Storage policies before configuration",
);
assert.equal(policies[0].policyname, "templates_quarantine_insert");
if (mode === "configure") {
  const existing = await admin.storage.listBuckets();
  assert.ifError(existing.error);
  for (const id of templateBuckets) {
    const r = existing.data.some((bucket) => bucket.id === id)
      ? await admin.storage.updateBucket(id, templateBucketOptions)
      : await admin.storage.createBucket(id, templateBucketOptions);
    assert.ifError(r.error);
  }
}
for (const id of templateBuckets) {
  const r = await admin.storage.getBucket(id);
  assert.ifError(r.error);
  assert.equal(r.data.public, false);
  assert.equal(Number(r.data.file_size_limit), 10000000);
  assert.deepEqual(r.data.allowed_mime_types, ["application/pdf"]);
  console.log(
    JSON.stringify({
      ref,
      bucket: id,
      private: true,
      maxBytes: 10000000,
      mimeTypes: r.data.allowed_mime_types,
    }),
  );
}
if (mode === "collect") {
  const templates = templateInfrastructure(admin, admin, url, secret);
  const candidates = await templates.cleanupCandidates();
  for (const id of candidates) await templates.collect(id);
  console.log(JSON.stringify({ ref, collectedCandidates: candidates.length }));
}
