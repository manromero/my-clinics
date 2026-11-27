import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { execFile, execFileSync, spawn } from "node:child_process";
import { promisify } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { PDFDocument, PDFName } from "pdf-lib";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
export function checkTemplateBucket(bucket) {
  assert.equal(bucket.public, false);
  assert.equal(Number(bucket.file_size_limit), 10000000);
  assert.deepEqual(bucket.allowed_mime_types, ["application/pdf"]);
}
export async function templateFixture(size = 10000, missing = false) {
  const d = await PDFDocument.create(),
    page = d.addPage();
  for (const name of [
    "invoice_number",
    "issue_date",
    "gross_amount",
    "withholding_amount",
    "net_amount",
  ]) {
    if (missing && name === "net_amount") continue;
    d.getForm().createTextField(name).addToPage(page);
  }
  let padding = Math.max(0, size - 6000),
    bytes;
  for (let i = 0; i < 6; i++) {
    const ref = d.context.register(d.context.stream(Buffer.alloc(padding)));
    d.catalog.set(PDFName.of("Padding"), ref);
    bytes = await d.save({ useObjectStreams: false });
    if (bytes.length === size) break;
    d.context.delete(ref);
    padding += size - bytes.length;
  }
  assert.equal(bytes.length, size);
  return bytes;
}

export async function templateStorageTests({
  ref,
  api,
  query,
  production = false,
}) {
  assert.ok(!["lvqbrjybwstvdhaxyxyn", "xihkrkgrhupiwcsfjctp"].includes(ref));
  const { templateInfrastructure, templateBucket, templateBucketOptions } =
    await import("../src/lib/templates/infrastructure.ts");
  const result = {
    ref,
    date: new Date().toISOString(),
    head: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    checks: [],
    passed: false,
  };
  const checked = (label, details = {}) => {
    result.checks.push({ label, ...details });
    console.log("Template check passed: " + label);
  };
  const keys = await api(`/projects/${ref}/api-keys?reveal=true`),
    secret = keys.find((k) => k.name === "service_role").api_key,
    anon = keys.find((k) => k.name === "anon").api_key,
    publishable = keys.find((k) => k.type === "publishable")?.api_key,
    url = `https://${ref}.supabase.co`;
  const options = {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(30000) }),
    },
  };
  const admin = createClient(url, secret, options),
    anonymous = createClient(url, anon, options);
  assert.ifError(
    (await admin.storage.createBucket(templateBucket, templateBucketOptions))
      .error,
  );
  checkTemplateBucket((await admin.storage.getBucket(templateBucket)).data);
  assert.deepEqual(
    await query(
      ref,
      "select policyname from pg_policies where schemaname='storage' and tablename='objects' order by policyname",
    ),
    [],
  );
  checked("one private PDF bucket,10MB limit; no ordinary Storage policies");
  await promisify(execFile)(
    process.execPath,
    [
      "--conditions=react-server",
      "--use-system-ca",
      "scripts/template-storage-operator.mjs",
      "inspect",
      ref,
    ],
    { env: process.env, maxBuffer: 100000 },
  );
  await api(`/projects/${ref}/postgrest`, "PATCH", { db_schema: "public" });
  async function ready() {
    const end = Date.now() + 30000;
    while (Date.now() < end) {
      const r = await fetch(url + "/rest/v1/", {
        headers: { apikey: secret, Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);
      if (r?.ok && (await r.json()).paths?.["/rpc/template_request"]) return;
      await new Promise((r) => setTimeout(r, 250));
    }
    throw Error("DataAPI readiness timeout");
  }
  const sql = async (text) => {
    await api(`/projects/${ref}/postgrest`, "PATCH", { db_schema: "" });
    try {
      return await query(ref, text);
    } finally {
      await api(`/projects/${ref}/postgrest`, "PATCH", { db_schema: "public" });
      await ready();
    }
  };
  const users = [];
  let app;
  async function upload(user, begun, bytes) {
    assert.equal(begun.uploadGrant.transport, "signed-standard");
    for (const value of [
      secret,
      user.session.access_token,
      user.session.refresh_token,
    ])
      assert.ok(!JSON.stringify(begun).includes(value));
    const r = await anonymous.storage
      .from(templateBucket)
      .uploadToSignedUrl(
        begun.uploadPath,
        begun.uploadGrant.token,
        new Blob([bytes], { type: "application/pdf" }),
        { contentType: "application/pdf" },
      );
    assert.ifError(r.error);
  }
  async function listed(user, id) {
    const r = await admin.storage
      .from(templateBucket)
      .list(user.id, { search: id });
    assert.ifError(r.error);
    return r.data.some((o) => o.name === id + ".pdf");
  }
  const deny = (promise, code) =>
    assert.rejects(promise, (e) => e.code === code);
  try {
    await ready();
    for (let i = 0; i < 2; i++) {
      const email = `template-${randomUUID()}@example.test`,
        password = randomUUID() + randomUUID(),
        made = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
      assert.ifError(made.error);
      const client = createClient(url, anon, options),
        signed = await client.auth.signInWithPassword({ email, password });
      assert.ifError(signed.error);
      users.push({
        client,
        id: made.data.user.id,
        session: signed.data.session,
        templates: templateInfrastructure(client, admin, url, secret),
      });
    }
    const [a, b] = users;
    const made = await a.client
      .from("clinics")
      .insert({
        owner_id: a.id,
        name: "Template business fixture",
        percentage: 20,
      })
      .select("id::text,template_revision::text")
      .single();
    assert.ifError(made.error);
    const clinicId = made.data.id;
    assert.ifError(
      (
        await a.client
          .from("clinics")
          .update({ active: false })
          .eq("id", clinicId)
      ).error,
    );
    let revision = "2";
    const bytes = await templateFixture(10000000),
      sha = hash(bytes);
    const input = (changes = {}) => ({
      requestId: randomUUID(),
      clinicId,
      revision,
      name: "Inactive with template",
      percentage: 25,
      active: false,
      mode: "replace",
      filename: "original.pdf",
      sha256: sha,
      bytes: bytes.length,
      ...changes,
    });
    async function productionProof(currentRevision, proofBytes) {
      assert.ok(
        publishable?.startsWith("sb_publishable_"),
        "Disposable publishable key required for production SSR proof",
      );
      proofBytes ??= await templateFixture(10000000);
      const nextInput = {
        requestId: randomUUID(),
        clinicId,
        revision: currentRevision,
        name: "Production streaming template",
        percentage: 25,
        active: false,
        mode: "replace",
        sha256: hash(proofBytes),
        bytes: proofBytes.length,
      };
      const nextBegin = await a.templates.begin(nextInput);
      await upload(a, nextBegin, proofBytes);
      await a.templates.validate(nextInput.requestId);
      const nextSaved = await a.templates.commit(nextInput.requestId);
      async function cookiesFor(user) {
        const jar = [];
        const ssr = createServerClient(url, publishable, {
          cookies: {
            getAll: () => jar,
            setAll: (values) => {
              for (const c of values) {
                const index = jar.findIndex((x) => x.name === c.name);
                if (index < 0) jar.push(c);
                else jar[index] = c;
              }
            },
          },
        });
        assert.ifError(
          (
            await ssr.auth.setSession({
              access_token: user.session.access_token,
              refresh_token: user.session.refresh_token,
            })
          ).error,
        );
        return jar.map((c) => `${c.name}=${c.value}`).join("; ");
      }
      const cookie = await cookiesFor(a),
        foreignCookie = await cookiesFor(b);
      const env = {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: url,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishable,
        SUPABASE_TEMPLATE_SECRET_KEY: secret,
      };
      delete env.SUPABASE_ACCESS_TOKEN;
      const build = () =>
        promisify(execFile)(
          process.execPath,
          ["node_modules/next/dist/bin/next", "build"],
          { env, maxBuffer: 2000000 },
        );
      try {
        await build();
      } catch (error) {
        if (String(error.stderr).includes("SecurityFatalError")) {
          console.log(
            "Existing Next security advisory: retrying identical build once; upgrade remains separate scope",
          );
          await build();
        } else {
          let diagnostic = String(error.stderr ?? error.message);
          for (const value of [secret, anon, publishable])
            diagnostic = diagnostic.replaceAll(value, "[redacted]");
          console.error(diagnostic.slice(0, 2500));
          throw new Error("Production build failed; see redacted diagnostic");
        }
      }
      const clientFiles = async (folder) =>
        (
          await Promise.all(
            (await readdir(folder, { withFileTypes: true })).map((item) =>
              item.isDirectory()
                ? clientFiles(`${folder}/${item.name}`)
                : [`${folder}/${item.name}`],
            ),
          )
        ).flat();
      for (const file of (await clientFiles(".next/static")).filter((file) =>
        file.endsWith(".js"),
      ))
        assert.ok(
          !(await readFile(file)).includes(Buffer.from(secret)),
          "Service credential in client build",
        );
      app = spawn(
        process.execPath,
        [
          "node_modules/next/dist/bin/next",
          "start",
          "--hostname",
          "127.0.0.1",
          "--port",
          "3217",
        ],
        { env, stdio: "ignore", windowsHide: true },
      );
      let ready = false;
      for (let i = 0; i < 60; i++) {
        try {
          await fetch("http://127.0.0.1:3217/login");
          ready = true;
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
      assert.ok(ready);
      const route = `http://127.0.0.1:3217/api/clinic-templates/${clinicId}/${nextInput.requestId}`;
      assert.equal((await fetch(route)).status, 401);
      assert.equal(
        (await fetch(route, { headers: { Cookie: foreignCookie } })).status,
        404,
      );
      const response = await fetch(route, { headers: { Cookie: cookie } });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
      assert.equal(
        hash(new Uint8Array(await response.arrayBuffer())),
        hash(proofBytes),
      );
      const remove = {
        requestId: randomUUID(),
        clinicId,
        revision: nextSaved.revision,
        name: "Removed production template",
        percentage: 25,
        active: false,
        mode: "remove",
      };
      await a.templates.begin(remove);
      await a.templates.commit(remove.requestId);
      assert.equal(
        (await fetch(route, { headers: { Cookie: cookie } })).status,
        404,
      );
      checked(
        "actual Next production route:10MB/hash,no-store,anonymous401,cross-owner404,removed404;no service credential in client assets",
      );
    }
    const first = input(),
      opened = await a.templates.begin(first);
    await upload(a, opened, bytes);
    await a.templates.validate(first.requestId);
    const saved = await a.templates.commit(first.requestId);
    revision = saved.revision;
    assert.deepEqual(await a.templates.commit(first.requestId), saved);
    assert.equal(await listed(a, first.requestId), true);
    assert.equal(
      (
        await a.client
          .from("clinics")
          .select("active")
          .eq("id", clinicId)
          .single()
      ).data.active,
      false,
    );
    const stream = await a.templates.read(clinicId, first.requestId);
    assert.equal(hash(new Uint8Array(await stream.arrayBuffer())), sha);
    assert.equal(stream.headers.get("cache-control"), "private, no-store");
    await deny(b.templates.read(clinicId, first.requestId), "42501");
    checked(
      "ordinary signed SDK multipart10MB, same-object validation, inactive atomic publication and idempotent retry",
    );
    assert.ok(
      (await a.client.storage.from(templateBucket).download(opened.uploadPath))
        .error,
    );
    assert.ok(
      (await anonymous.storage.from(templateBucket).download(opened.uploadPath))
        .error,
    );
    assert.equal(
      (
        await a.client
          .from("template_save_requests")
          .update({ state: "ready" })
          .eq("id", first.requestId)
      ).error?.code,
      "42501",
    );
    assert.equal(
      (await anonymous.from("template_save_requests").select("id")).error?.code,
      "42501",
    );
    assert.deepEqual(
      (
        await b.client
          .from("template_save_requests")
          .select("id")
          .eq("id", first.requestId)
      ).data,
      [],
    );
    checked(
      "normal owner/foreign/anonymous metadata and direct-byte access boundaries",
    );
    const over = input({ bytes: 10000000 }),
      overBegin = await a.templates.begin(over);
    const oversized = await anonymous.storage
      .from(templateBucket)
      .uploadToSignedUrl(
        overBegin.uploadPath,
        overBegin.uploadGrant.token,
        new Blob([await templateFixture(10000001)], {
          type: "application/pdf",
        }),
        { contentType: "application/pdf" },
      );
    assert.ok(oversized.error);
    assert.ok(/size|maximum|large|limit/i.test(oversized.error.message));
    assert.equal(await listed(a, over.requestId), false);
    await a.templates.cancel(over.requestId);
    checked("boundary+1 denied by actual size error", {
      status: oversized.error.statusCode,
    });
    const cancel = input(),
      cancelBegin = await a.templates.begin(cancel);
    await upload(a, cancelBegin, bytes);
    await a.templates.cancel(cancel.requestId);
    assert.equal(await listed(a, cancel.requestId), false);
    await deny(a.templates.commit(cancel.requestId), "55000");
    assert.equal((await a.templates.begin(cancel)).uploadGrant, null);
    assert.equal(
      hash(
        new Uint8Array(
          await (
            await a.templates.read(clinicId, first.requestId)
          ).arrayBuffer(),
        ),
      ),
      sha,
    );
    checked("Cancel deletes unused object and preserves saved pair");
    const missing = await templateFixture(10000, true),
      invalid = input({ bytes: missing.length, sha256: hash(missing) }),
      invalidBegin = await a.templates.begin(invalid);
    await upload(a, invalidBegin, missing);
    assert.equal((await a.templates.validate(invalid.requestId)).valid, false);
    assert.equal(await listed(a, invalid.requestId), false);
    await deny(a.templates.commit(invalid.requestId), "55000");
    checked(
      "invalid stored PDF automatically cancels/deletes without changing current association",
    );
    const replacement = input(),
      replacementBegin = await a.templates.begin(replacement);
    await upload(a, replacementBegin, bytes);
    await a.templates.validate(replacement.requestId);
    const actualFetch = globalThis.fetch;
    let replaced;
    globalThis.fetch = (input, init) =>
      init?.method === "DELETE"
        ? Promise.resolve(
            new Response("temporary deletion outage", { status: 503 }),
          )
        : actualFetch(input, init);
    try {
      replaced = await a.templates.commit(replacement.requestId);
    } finally {
      globalThis.fetch = actualFetch;
    }
    assert.equal(replaced.cleanupPending, true);
    assert.equal(await listed(a, first.requestId), true);
    const recovered = await a.templates.outcome(replacement.requestId);
    assert.deepEqual(recovered, { ...replaced, cleanupPending: false });
    revision = replaced.revision;
    assert.equal(await listed(a, first.requestId), false);
    assert.equal(await listed(a, replacement.requestId), true);
    await deny(a.templates.read(clinicId, first.requestId), "42501");
    assert.deepEqual(await a.templates.commit(first.requestId), saved);
    checked(
      "replacement stays saved despite deletion outage; same-operation outcome retries old-file deletion",
    );
    const abandoned = input(),
      abandonedBegin = await a.templates.begin(abandoned);
    await upload(a, abandonedBegin, bytes);
    await sql(
      `update public.template_save_requests set expires_at=now()-interval '1 second' where id='${abandoned.requestId}'`,
    );
    await a.templates.cancel(abandoned.requestId);
    assert.equal(await listed(a, abandoned.requestId), false);
    await deny(a.templates.commit(abandoned.requestId), "55000");
    checked("retrying its exact Cancel deletes an expired abandoned object");
    const race = [
      input({
        mode: "keep",
        bytes: undefined,
        sha256: undefined,
        name: "Winner A",
      }),
      input({
        mode: "keep",
        bytes: undefined,
        sha256: undefined,
        name: "Winner B",
      }),
    ];
    for (const request of race) await a.templates.begin(request);
    const outcomes = await Promise.allSettled(
      race.map((r) => a.templates.commit(r.requestId)),
    );
    assert.equal(outcomes.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(
      outcomes.find((r) => r.status === "rejected").reason.code,
      "PT409",
    );
    const winner = outcomes.findIndex((r) => r.status === "fulfilled");
    revision = outcomes[winner].value.revision;
    const actual = await a.client
      .from("clinics")
      .select("name,template_revision::text")
      .eq("id", clinicId)
      .single();
    assert.equal(actual.data.name, race[winner].name);
    assert.equal(actual.data.template_revision, revision);
    checked(
      "concurrent ordinary saves:one winner,PT409 loser,winning row preserved",
    );
    const foreign = await b.client
      .from("clinics")
      .insert({ owner_id: b.id, name: "Second ordinary owner", percentage: 25 })
      .select("id::text,template_revision::text")
      .single();
    assert.ifError(foreign.error);
    const second = input({
        clinicId: foreign.data.id,
        revision: foreign.data.template_revision,
        name: "Second ordinary owner",
        active: true,
      }),
      secondBegin = await b.templates.begin(second);
    await upload(b, secondBegin, bytes);
    await b.templates.validate(second.requestId);
    await b.templates.commit(second.requestId);
    assert.equal(
      hash(
        new Uint8Array(
          await (
            await b.templates.read(foreign.data.id, second.requestId)
          ).arrayBuffer(),
        ),
      ),
      sha,
    );
    const removeSecond = input({
      clinicId: foreign.data.id,
      revision: "2",
      name: "Second ordinary owner",
      active: true,
      mode: "remove",
      sha256: undefined,
      bytes: undefined,
    });
    await b.templates.begin(removeSecond);
    await b.templates.commit(removeSecond.requestId);
    assert.equal(await listed(b, second.requestId), false);
    checked(
      "second ordinary owner uploads/validates/reads/removes its template",
    );
    const remove = input({
      mode: "remove",
      sha256: undefined,
      bytes: undefined,
    });
    await a.templates.begin(remove);
    const removed = await a.templates.commit(remove.requestId);
    revision = removed.revision;
    assert.equal(removed.templateId, null);
    assert.equal(await listed(a, replacement.requestId), false);
    await deny(a.templates.read(clinicId, replacement.requestId), "42501");
    checked(
      "remove automatically deletes unlinked bytes and rejects new stale reads",
    );
    if (production) await productionProof(revision);
    result.passed = true;
  } finally {
    if (app) {
      app.kill();
      await new Promise((resolve) => {
        if (app.exitCode !== null) resolve();
        else {
          app.once("exit", resolve);
          setTimeout(resolve, 5000);
        }
      });
    }
    await api(`/projects/${ref}/postgrest`, "PATCH", { db_schema: "" });
  }
  return result;
}
