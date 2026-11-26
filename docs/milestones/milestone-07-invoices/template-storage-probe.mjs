// Phase 1 disposable research only. Never imports or configures application code.
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const {
  PDFDocument,
  PDFName,
} = require("../../../.env.template-research/node_modules/pdf-lib");
const org = "njnmfutclorywskqrftd";
const protectedRefs = ["lvqbrjybwstvdhaxyxyn", "xihkrkgrhupiwcsfjctp"];
const evidence = {
  date: new Date().toISOString(),
  node: process.version,
  results: [],
};
const record = (label, data) => {
  evidence.results.push({ label, ...data });
  console.log(JSON.stringify({ label, ...data }));
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function api(path, method = "GET", body) {
  const r = await fetch(`https://api.supabase.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok) throw new Error(`Management ${method} ${path}: ${r.status}`);
  return r.status === 204 ? null : r.json();
}
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const encryptedFixtures = {
  "encrypted_new.pdf":
    "a9b6d95fa1d4a18ba0a9da2fc1b58d9702582d4905006f94eaf7234d60233e8c",
  "encrypted_old.pdf":
    "e114c47dbb70c0ce7f0fd5bf58dec35bd638a1a3388346f4e17625ffa724c641",
};
if (process.argv.includes("--setup-fixtures")) {
  for (const [filename, expected] of Object.entries(encryptedFixtures)) {
    const response = await fetch(
      `https://raw.githubusercontent.com/Hopding/pdf-lib/93dd36e85aa659a3bca09867d2d8fac172501fbe/assets/pdfs/${filename}`,
    );
    assert.ok(response.ok);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(sha(bytes), expected);
    await writeFile(
      new URL(`../../../.env.template-research/${filename}`, import.meta.url),
      bytes,
    );
    console.log(`Verified fixture: ${filename}`);
  }
  process.exit(0);
}
const fields = [
  "invoice_number",
  "issue_date",
  "gross_amount",
  "withholding_amount",
  "net_amount",
];
async function pdf(size, omit = false, wrongType = false) {
  const d = await PDFDocument.create();
  const page = d.addPage();
  for (const [i, name] of fields.entries()) {
    if (omit && i === 4) continue;
    const field =
      wrongType && i === 4
        ? d.getForm().createCheckBox(name)
        : d.getForm().createTextField(name);
    field.addToPage(page, { x: 20, y: 30 + i * 45, width: 100, height: 20 });
  }
  let padding = Math.max(0, size - 5000);
  let bytes;
  for (let i = 0; i < 5; i++) {
    d.catalog.set(
      PDFName.of("ResearchPadding"),
      d.context.register(d.context.stream(Buffer.alloc(padding))),
    );
    bytes = await d.save({ useObjectStreams: false });
    if (bytes.length === size || size < 10000) break;
    // Reuse one stream instead of retaining old registered streams.
    const ref = d.catalog.get(PDFName.of("ResearchPadding"));
    d.context.delete(ref);
    padding += size - bytes.length;
  }
  return bytes;
}
async function validate(bytes) {
  if (bytes.length > 10000000) return "too-large";
  try {
    const d = await PDFDocument.load(bytes);
    if (d.isEncrypted) return "encrypted";
    for (const name of fields) d.getForm().getTextField(name);
    return "valid";
  } catch {
    return "invalid-or-missing-text-field";
  }
}
if (process.argv.includes("--local")) {
  for (const [label, data, expected] of [
    ["below-boundary", await pdf(9999999), "valid"],
    ["boundary", await pdf(10000000), "valid"],
    ["oversize", await pdf(10000001), "too-large"],
    ["missing", await pdf(6000, true), "invalid-or-missing-text-field"],
    [
      "wrong-type",
      await pdf(6000, false, true),
      "invalid-or-missing-text-field",
    ],
    ["spoof", Buffer.from("not a PDF"), "invalid-or-missing-text-field"],
  ]) {
    const start = performance.now();
    const result = await validate(data);
    assert.equal(result, expected);
    record(`pdf-${label}`, {
      bytes: data.length,
      result,
      ms: Math.round(performance.now() - start),
    });
  }
  for (const filename of ["encrypted_new.pdf", "encrypted_old.pdf"]) {
    const bytes = await readFile(
      new URL(`../../../.env.template-research/${filename}`, import.meta.url),
    );
    assert.equal(sha(bytes), encryptedFixtures[filename]);
    assert.equal(await validate(bytes), "invalid-or-missing-text-field");
    let encryptionDetected = false;
    try {
      await PDFDocument.load(bytes);
    } catch (e) {
      encryptionDetected = e.message.includes("encrypted");
    }
    assert.ok(encryptionDetected);
    record(filename, {
      bytes: bytes.length,
      sha256: sha(bytes),
      encryptionRejected: true,
    });
  }
  const bytes = await pdf(10000000);
  assert.equal(bytes.length, 10000000);
  const form = new FormData();
  form.set(
    "file",
    new Blob([bytes], { type: "application/pdf" }),
    "template.pdf",
  );
  form.set("name", "Research clinic");
  record("multipart", {
    fileBytes: bytes.length,
    bodyBytes: (
      await new Request("http://localhost", {
        method: "POST",
        body: form,
      }).arrayBuffer()
    ).byteLength,
  });
  evidence.memory = process.memoryUsage();
  if (!process.argv.includes("--verify"))
    await writeFile(
      new URL("template-storage-local-results.json", import.meta.url),
      `${JSON.stringify(evidence, null, 2)}\n`,
    );
  process.exit(0);
}
let ref;
const name = `myclinics-validation-template-${randomBytes(5).toString("hex")}`;
try {
  assert.equal(
    process.env.MYCLINICS_DISPOSABLE_AUTHORIZATION,
    org,
    "Explicit disposable authorization required",
  );
  assert.equal(
    (await api(`/organizations/${org}`)).plan,
    "free",
    "Only Free plan authorized",
  );
  const dev = await api(`/projects/${protectedRefs[0]}`);
  assert.equal(dev.name, "my-clinics_dev");
  assert.equal(dev.status, "INACTIVE");
  const p = await api("/projects", "POST", {
    name,
    organization_slug: org,
    region: "eu-central-1",
    db_pass: randomBytes(32).toString("base64url"),
  });
  ref = p.id ?? p.ref;
  assert.match(ref, /^[a-z]{20}$/);
  assert.ok(!protectedRefs.includes(ref));
  evidence.ref = ref;
  evidence.name = name;
  record("created", { ref, name });
  for (let i = 0; ; i++) {
    const current = await api(`/projects/${ref}`);
    assert.equal(current.name, name);
    assert.equal(current.organization_id, org);
    if (current.status === "ACTIVE_HEALTHY") break;
    assert.ok(i < 120, "Provision timeout");
    if (i % 6 === 0) record("provisioning", { status: current.status });
    await wait(5000);
  }
  await api(`/projects/${ref}/postgrest`, "PATCH", { db_schema: "" });
  const sql = async (query) => {
    assert.ok(
      ["", "pg_pgrst_no_exposed_schemas"].includes(
        (await api(`/projects/${ref}/postgrest`)).db_schema,
      ),
    );
    return api(`/projects/${ref}/database/query`, "POST", { query });
  };
  const keys = await api(`/projects/${ref}/api-keys?reveal=true`);
  const adminKey = keys.find((k) => k.name === "service_role").api_key;
  const anonKey = keys.find((k) => k.name === "anon").api_key;
  assert.ok(
    adminKey && anonKey,
    "Revealed disposable legacy API keys unavailable",
  );
  const url = `https://${ref}.supabase.co`;
  const admin = createClient(url, adminKey, {
    auth: { persistSession: false },
  });
  const users = [];
  for (let i = 0; i < 2; i++) {
    const email = `research-${i}-${randomBytes(4).toString("hex")}@example.test`;
    const password = randomBytes(24).toString("base64url");
    const made = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    assert.ifError(made.error);
    const c = createClient(url, anonKey, { auth: { persistSession: false } });
    const session = await c.auth.signInWithPassword({ email, password });
    assert.ifError(session.error);
    users.push({
      c,
      id: made.data.user.id,
      token: session.data.session.access_token,
    });
  }
  const [a, b] = users;
  const anonymous = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  for (const id of ["research-stage", "research-ready"]) {
    const r = await admin.storage.createBucket(id, {
      public: false,
      fileSizeLimit: 10000000,
      allowedMimeTypes: ["application/pdf"],
    });
    assert.ifError(r.error);
  }
  await sql(`create schema research;
    create table research.binding(path text primary key, owner uuid not null, current boolean not null default true);
    grant usage on schema research to authenticated;
    grant select on research.binding to authenticated;
    alter table research.binding enable row level security;
    create policy binding_owner on research.binding for select to authenticated using(owner=auth.uid());
    create policy research_upload on storage.objects for insert to authenticated with check(bucket_id='research-stage' and (storage.foldername(name))[1]=auth.uid()::text);
    create policy research_read on storage.objects for select to authenticated using(bucket_id='research-ready' and exists(select 1 from research.binding b where b.path=name and b.owner=auth.uid() and b.current));`);
  record("ready", { ref, dataApi: "disabled", users: 2 });
  const bytes = await pdf(10000000);
  assert.equal(bytes.length, 10000000);
  for (const [label, data] of [
    ["boundary", bytes],
    ["oversize", await pdf(10000001)],
    ["missing", await pdf(6000, true)],
    ["wrong-type", await pdf(6000, false, true)],
    ["spoof", Buffer.from("not a PDF")],
  ]) {
    const start = performance.now();
    const result = await validate(data);
    record(`pdf-${label}`, {
      bytes: data.length,
      result,
      ms: Math.round(performance.now() - start),
    });
  }
  const form = new FormData();
  form.set(
    "file",
    new Blob([bytes], { type: "application/pdf" }),
    "template.pdf",
  );
  form.set("name", "Research clinic");
  record("multipart", {
    fileBytes: bytes.length,
    bodyBytes: (
      await new Request("http://localhost", {
        method: "POST",
        body: form,
      }).arrayBuffer()
    ).byteLength,
  });
  const path = `${a.id}/standard.pdf`;
  let start = performance.now();
  let result = await a.c.storage
    .from("research-stage")
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });
  assert.ifError(result.error);
  record("standard-10MB", {
    ms: Math.round(performance.now() - start),
    bytes: bytes.length,
  });
  const over = await a.c.storage
    .from("research-stage")
    .upload(`${a.id}/oversize.pdf`, await pdf(10000001), {
      contentType: "application/pdf",
    });
  assert.ok(over.error);
  record("storage-oversize", { status: over.error.statusCode });
  for (const [label, c, object] of [
    ["owner-staged-read", a.c, path],
    ["cross-staged-read", b.c, path],
    ["anon-staged-read", anonymous, path],
  ]) {
    const r = await c.storage.from("research-stage").download(object);
    assert.ok(r.error);
    record(label, { denied: true, status: r.error.statusCode });
  }
  const forged = await b.c.storage
    .from("research-stage")
    .upload(`${a.id}/forged.pdf`, bytes, { contentType: "application/pdf" });
  assert.ok(forged.error);
  record("cross-upload", { denied: true, status: forged.error.statusCode });
  const anonymousUpload = await anonymous.storage
    .from("research-stage")
    .upload(`${a.id}/anon.pdf`, bytes, { contentType: "application/pdf" });
  assert.ok(anonymousUpload.error);
  record("anonymous-upload", {
    denied: true,
    status: anonymousUpload.error.statusCode,
  });
  const bogus = await a.c.storage
    .from("research-stage")
    .upload(`${a.id}/spoof.pdf`, Buffer.from("not a PDF"), {
      contentType: "application/pdf",
    });
  assert.ifError(bogus.error);
  record("mime-is-not-validation", { accepted: true });
  const tusHeaders = {
    apikey: anonKey,
    Authorization: `Bearer ${a.token}`,
    "Tus-Resumable": "1.0.0",
  };
  const tusPath = `${a.id}/tus.pdf`;
  const metadata = Object.entries({
    bucketName: "research-stage",
    objectName: tusPath,
    contentType: "application/pdf",
    cacheControl: "0",
  })
    .map(([k, v]) => `${k} ${Buffer.from(v).toString("base64")}`)
    .join(",");
  start = performance.now();
  let r = await fetch(
    `https://${ref}.storage.supabase.co/storage/v1/upload/resumable`,
    {
      method: "POST",
      headers: {
        ...tusHeaders,
        "Upload-Length": String(bytes.length),
        "Upload-Metadata": metadata,
      },
    },
  );
  assert.equal(r.status, 201);
  const location = r.headers.get("location");
  assert.ok(new URL(location).hostname.endsWith("supabase.co"));
  const chunk = 6 * 1024 * 1024;
  r = await fetch(location, {
    method: "PATCH",
    headers: {
      ...tusHeaders,
      "Content-Type": "application/offset+octet-stream",
      "Upload-Offset": "0",
    },
    body: bytes.slice(0, chunk),
  });
  assert.equal(r.status, 204);
  // Simulate loss of client state between requests; recover server offset.
  r = await fetch(location, { method: "HEAD", headers: tusHeaders });
  assert.equal(Number(r.headers.get("upload-offset")), chunk);
  r = await fetch(location, {
    method: "PATCH",
    headers: {
      ...tusHeaders,
      "Content-Type": "application/offset+octet-stream",
      "Upload-Offset": String(chunk),
    },
    body: bytes.slice(chunk),
  });
  assert.equal(r.status, 204);
  const downloaded = await admin.storage
    .from("research-stage")
    .download(tusPath);
  assert.ifError(downloaded.error);
  assert.equal(
    sha(new Uint8Array(await downloaded.data.arrayBuffer())),
    sha(bytes),
  );
  record("tus-resume-10MB", {
    ms: Math.round(performance.now() - start),
    offset: chunk,
    hashEqual: true,
  });
  const signed = await admin.storage
    .from("research-stage")
    .createSignedUploadUrl(`${a.id}/signed.pdf`);
  assert.ifError(signed.error);
  const signedUpload = await anonymous.storage
    .from("research-stage")
    .uploadToSignedUrl(`${a.id}/signed.pdf`, signed.data.token, bytes, {
      contentType: "application/pdf",
    });
  assert.ifError(signedUpload.error);
  record("signed-upload-bearer", { anonymousWithToken: true });
  const finalPath = `${a.id}/immutable.pdf`;
  const final = await admin.storage
    .from("research-ready")
    .upload(finalPath, bytes, {
      contentType: "application/pdf",
      cacheControl: "0",
      upsert: false,
    });
  assert.ifError(final.error);
  await sql(
    `insert into research.binding(path,owner) values ('${finalPath}','${a.id}');`,
  );
  const ownerRead = await a.c.storage
    .from("research-ready")
    .download(finalPath);
  assert.ifError(ownerRead.error);
  record("ready-owner-read", { allowed: true });
  for (const [label, c] of [
    ["cross", b.c],
    ["anonymous", anonymous],
  ]) {
    const rr = await c.storage.from("research-ready").download(finalPath);
    assert.ok(rr.error);
    record(`ready-${label}-read`, {
      denied: true,
      status: rr.error.statusCode,
    });
  }
  const raw = await fetch(
    `${url}/storage/v1/object/authenticated/research-ready/${finalPath}`,
    { headers: { apikey: anonKey, Authorization: `Bearer ${a.token}` } },
  );
  record("authenticated-cache", {
    status: raw.status,
    cacheControl: raw.headers.get("cache-control"),
  });
  await raw.arrayBuffer();
  const downloadUrl = await a.c.storage
    .from("research-ready")
    .createSignedUrl(finalPath, 60);
  assert.ifError(downloadUrl.error);
  await sql(
    `update research.binding set current=false where path='${finalPath}';`,
  );
  const revoked = await a.c.storage.from("research-ready").download(finalPath);
  assert.ok(revoked.error);
  const bearer = await fetch(downloadUrl.data.signedUrl);
  assert.equal(bearer.status, 200);
  await bearer.arrayBuffer();
  record("read-revocation", {
    authenticatedDenied: true,
    signedStillReadable: true,
    signedTTL: 60,
  });
  const mutate = await a.c.storage
    .from("research-ready")
    .update(finalPath, Buffer.from("bad"), { contentType: "application/pdf" });
  assert.ok(mutate.error);
  record("ready-update", { denied: true, status: mutate.error.statusCode });
  for (const [label, c] of [
    ["owner", a.c],
    ["cross", b.c],
    ["anonymous", anonymous],
  ]) {
    await c.storage.from("research-ready").remove([finalPath]);
    const remains = await admin.storage
      .from("research-ready")
      .download(finalPath);
    assert.ifError(remains.error);
    assert.equal(
      sha(new Uint8Array(await remains.data.arrayBuffer())),
      sha(bytes),
    );
    record(`ready-${label}-delete`, { bytesPreserved: true });
  }
  // A small independent SQL transaction model tests the shared metadata decision.
  await sql(`create table research.clinic(id int primary key,name text unique,version int not null,template text);
    insert into research.clinic values(1,'before',1,'old'),(2,'duplicate',1,null);
    create function research.save(expected int,newname text,newtemplate text) returns int language plpgsql as $$
    declare n int; begin update research.clinic set name=newname,template=newtemplate,version=version+1 where id=1 and version=expected returning version into n;
    if n is null then raise exception 'conflict'; end if; return n; end $$;`);
  try {
    await sql("select research.save(1,'duplicate','new')");
    assert.fail("Expected unique failure");
  } catch (e) {
    assert.ok(!e.message.includes("Expected"));
  }
  const preserved = await sql(
    "select name,version,template from research.clinic where id=1",
  );
  assert.deepEqual(preserved, [
    { name: "before", version: 1, template: "old" },
  ]);
  const race = await Promise.allSettled([
    sql("select research.save(1,'winner-a','a')"),
    sql("select research.save(1,'winner-b','b')"),
  ]);
  assert.equal(race.filter((x) => x.status === "fulfilled").length, 1);
  record("atomic-save-model", {
    failedSavePreserved: true,
    concurrentWinners: 1,
    concurrentConflicts: 1,
  });
  evidence.completed = true;
} catch (error) {
  evidence.failure = error.message;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (ref) {
    const current = await api(`/projects/${ref}`);
    assert.equal(current.name, name);
    assert.equal(current.organization_id, org);
    assert.ok(!protectedRefs.includes(ref));
    await api(`/projects/${ref}`, "DELETE");
    const inventory = await api(
      `/organizations/${org}/projects?limit=50&offset=0`,
    );
    assert.ok(!inventory.projects.some((p) => p.ref === ref));
    evidence.cleanupConfirmed = true;
    record("cleanup", { ref, absent: true });
  }
  await writeFile(
    new URL(
      `template-storage-probe-${ref ?? "no-target"}-results.json`,
      import.meta.url,
    ),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
}
