import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { execFile, spawn } from "node:child_process";
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
  const { templateInfrastructure, templateBuckets, templateBucketOptions } =
    await import("../src/lib/templates/infrastructure.ts");
  const result = { ref, date: new Date().toISOString(), checks: [] };
  const checked = (label, details = {}) => {
    result.checks.push({ label, ...details });
    console.log(`Template check passed: ${label}`);
  };
  const keys = await api(`/projects/${ref}/api-keys?reveal=true`);
  const secret = keys.find((k) => k.name === "service_role").api_key;
  const anon = keys.find((k) => k.name === "anon").api_key;
  const publishable = keys.find((k) => k.type === "publishable")?.api_key;
  const url = `https://${ref}.supabase.co`;
  const admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anonymous = createClient(url, anon, {
    auth: { persistSession: false },
  });
  for (const bucket of templateBuckets) {
    const made = await admin.storage.createBucket(
      bucket,
      templateBucketOptions,
    );
    assert.ifError(made.error);
    const live = await admin.storage.getBucket(bucket);
    assert.ifError(live.error);
    checkTemplateBucket(live.data);
  }
  const policies = await query(
    ref,
    "select policyname from pg_policies where schemaname='storage' and tablename='objects' order by policyname",
  );
  assert.deepEqual(policies, [{ policyname: "templates_quarantine_insert" }]);
  assert.deepEqual(
    await query(
      ref,
      "select relrowsecurity from pg_class where oid='storage.objects'::regclass",
    ),
    [{ relrowsecurity: true }],
  );
  checked(
    "private bucket API limits/MIME and exact application Storage policy inventory",
  );
  await promisify(execFile)(
    process.execPath,
    [
      "--conditions=react-server",
      "--use-system-ca",
      "scripts/template-storage-operator.mjs",
      "configure",
      ref,
    ],
    {
      env: { ...process.env, MYCLINICS_TEMPLATE_CONFIG_AUTHORIZATION: ref },
      maxBuffer: 100000,
    },
  );
  checked(
    "reproducible bucket operator configures/verifies exact disposable target",
  );
  // Explicit exception only after transactional SQL owner/grant checks passed.
  await api(`/projects/${ref}/postgrest`, "PATCH", { db_schema: "public" });
  const sql = async (statement) => {
    await api(`/projects/${ref}/postgrest`, "PATCH", { db_schema: "" });
    try {
      return await query(ref, statement);
    } finally {
      await api(`/projects/${ref}/postgrest`, "PATCH", { db_schema: "public" });
      const deadline = Date.now() + 30000;
      let ready = false;
      while (Date.now() < deadline) {
        const response = await fetch(`${url}/rest/v1/`, {
          headers: { apikey: secret, Authorization: `Bearer ${secret}` },
          signal: AbortSignal.timeout(5000),
        }).catch(() => null);
        if (response?.ok) {
          const schema = await response.json();
          if (schema.paths?.["/rpc/template_request"]) {
            ready = true;
            break;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      assert.ok(
        ready,
        "Disposable Data API did not become ready after scoped configuration reload",
      );
    }
  };
  let app;
  try {
    const users = [];
    for (let i = 0; i < 2; i++) {
      const email = `template-${randomUUID()}@example.test`,
        password = randomUUID() + randomUUID();
      const made = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      assert.ifError(made.error);
      const client = createClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signed = await client.auth.signInWithPassword({ email, password });
      assert.ifError(signed.error);
      users.push({
        client,
        id: made.data.user.id,
        session: signed.data.session,
        templates: templateInfrastructure(client, admin, url, secret),
      });
    }
    const [a, b] = users;
    const aClinic = await a.client
      .from("clinics")
      .insert({
        owner_id: a.id,
        name: "Inactive before template",
        percentage: 20,
      })
      .select("id::text,template_revision::text")
      .single();
    assert.ifError(aClinic.error);
    const clinicId = aClinic.data.id;
    assert.ifError(
      (
        await a.client
          .from("clinics")
          .update({ active: false })
          .eq("id", clinicId)
      ).error,
    );
    let revision = "2";
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
      assert.ifError(
        (
          await a.client.storage
            .from(templateBuckets[0])
            .upload(nextBegin.uploadPath, proofBytes, {
              contentType: "application/pdf",
            })
        ).error,
      );
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
    if (process.argv.includes("--production-only")) {
      await productionProof(revision);
      result.passed = true;
      return result;
    }
    if (process.argv.includes("--cleanup-only")) {
      const data = await templateFixture();
      const id = randomUUID();
      const opened = await a.templates.begin({
        requestId: id,
        clinicId,
        revision,
        name: "Cleanup race",
        percentage: 25,
        active: false,
        mode: "replace",
        sha256: hash(data),
        bytes: data.length,
      });
      assert.ifError(
        (
          await a.client.storage
            .from(templateBuckets[0])
            .upload(opened.uploadPath, data, { contentType: "application/pdf" })
        ).error,
      );
      await a.templates.cancel(id);
      await sql(
        `update public.template_save_requests set expires_at=now()-interval '28 hours' where id='${id}'`,
      );
      const raced = await Promise.allSettled([
        admin.rpc("claim_template_cleanup", { p_id: id }).then((r) => {
          if (r.error)
            throw Object.assign(new Error("claim failed"), {
              code: r.error.code,
              status: r.status,
            });
          return r.data;
        }),
        a.templates.commit(id),
      ]);
      console.log(
        JSON.stringify({
          cleanup: raced.map((r) =>
            r.status === "fulfilled"
              ? { status: r.status }
              : {
                  status: r.status,
                  code: r.reason?.code,
                  http: r.reason?.status,
                  name: r.reason?.name,
                },
          ),
        }),
      );
      assert.equal(raced[0].status, "fulfilled");
      assert.equal(raced[1].status, "rejected");
      assert.equal(raced[1].reason.code, "55000");
      await sql(
        `update public.template_save_requests set lease_until=now()-interval '1 second' where id='${id}'`,
      );
      await a.templates.collect(id);
      assert.ok(
        !(
          await admin.storage
            .from(templateBuckets[0])
            .list(a.id, { search: id })
        ).data.some((item) => item.name === `${id}.pdf`),
      );
      await assert.rejects(
        a.templates.commit(id),
        (error) => error.code === "55000",
      );
      const liveId = randomUUID();
      const live = await a.templates.begin({
        requestId: liveId,
        clinicId,
        revision,
        name: "Live cleanup exclusion",
        percentage: 25,
        active: false,
        mode: "replace",
        sha256: hash(data),
        bytes: data.length,
      });
      assert.ifError(
        (
          await a.client.storage
            .from(templateBuckets[0])
            .upload(live.uploadPath, data, { contentType: "application/pdf" })
        ).error,
      );
      await a.templates.validate(liveId);
      await a.templates.commit(liveId);
      const excluded = await admin.rpc("claim_template_cleanup", {
        p_id: liveId,
      });
      console.log(
        JSON.stringify({
          liveCleanupError: excluded.error?.code,
          liveCleanupHttp: excluded.status,
        }),
      );
      assert.equal(excluded.error?.code, "55000");
      checked(
        "focused cleanup/publication exclusion, lease retry, byte deletion and current reference guard",
      );
      result.passed = true;
      return result;
    }
    if (process.argv.includes("--concurrency-only")) {
      const requests = [];
      for (let i = 0; i < 2; i++) {
        const client = createClient(url, anon, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            storageKey: randomUUID(),
          },
        });
        assert.ifError(
          (
            await client.auth.setSession({
              access_token: a.session.access_token,
              refresh_token: a.session.refresh_token,
            })
          ).error,
        );
        const templates = templateInfrastructure(client, admin, url, secret);
        const requestId = randomUUID();
        await templates.begin({
          requestId,
          clinicId,
          revision,
          name: `Race ${i}`,
          percentage: 25,
          active: false,
          mode: "keep",
        });
        requests.push({ templates, requestId });
      }
      const outcomes = await Promise.allSettled(
        requests.map((r) => r.templates.commit(r.requestId)),
      );
      const rejected = outcomes.find((r) => r.status === "rejected")?.reason;
      let message = String(rejected?.message ?? "");
      for (const value of [
        secret,
        anon,
        a.session.access_token,
        a.session.refresh_token,
      ])
        message = message.replaceAll(value, "[redacted]");
      console.log(
        JSON.stringify({
          concurrency: outcomes.map((r) => r.status),
          rejection: {
            name: rejected?.name,
            code: rejected?.code,
            message: message.slice(0, 300),
          },
        }),
      );
      assert.equal(outcomes.filter((r) => r.status === "fulfilled").length, 1);
      assert.equal(rejected?.code, "PT409");
      checked("focused separate-request concurrency SQLSTATEPT409");
      result.passed = true;
      return result;
    }
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
    const deny = async (promise, code) => {
      await assert.rejects(promise, (e) => e.code === code);
    };
    const direct = await a.client.rpc("commit_template_save", {
      p_owner: a.id,
      p_id: randomUUID(),
    });
    assert.equal(direct.error?.code, "42501");
    const anonMetadata = await anonymous
      .from("template_save_requests")
      .select("id");
    assert.equal(anonMetadata.error?.code, "42501");
    await deny(b.templates.begin(input()), "42501");
    checked("anonymous/ordinary RPC denial and clinic-owner forgery");

    const request = input(),
      begun = await a.templates.begin(request);
    assert.equal(
      (
        await a.client
          .from("template_save_requests")
          .select("id")
          .eq("id", request.requestId)
      ).data.length,
      1,
    );
    assert.deepEqual(
      (
        await b.client
          .from("template_save_requests")
          .select("id")
          .eq("id", request.requestId)
      ).data,
      [],
    );
    assert.equal(
      (
        await a.client
          .from("template_save_requests")
          .update({ state: "ready", sha256: sha })
          .eq("id", request.requestId)
      ).error?.code,
      "42501",
    );
    assert.equal(
      (
        await a.client.from("clinic_templates").insert({
          clinic_id: clinicId,
          owner_id: a.id,
          template_id: request.requestId,
        })
      ).error?.code,
      "42501",
    );
    for (const client of [b.client, anonymous])
      assert.equal(
        String(
          (
            await client.storage
              .from(templateBuckets[0])
              .upload(begun.uploadPath, bytes, {
                contentType: "application/pdf",
              })
          ).error?.statusCode,
        ),
        "403",
      );
    assert.equal(
      String(
        (
          await a.client.storage
            .from(templateBuckets[0])
            .upload(`${a.id}/${randomUUID()}.pdf`, bytes, {
              contentType: "application/pdf",
            })
        ).error?.statusCode,
      ),
      "403",
    );
    checked(
      "metadata writes and foreign/arbitrary quarantine path forgery denied",
    );

    async function tus(
      user,
      path,
      data,
      accessToken = user.session.access_token,
    ) {
      const headers = {
        apikey: anon,
        Authorization: `Bearer ${accessToken}`,
        "Tus-Resumable": "1.0.0",
      };
      const metadata = Object.entries({
        bucketName: templateBuckets[0],
        objectName: path,
        contentType: "application/pdf",
        cacheControl: "0",
      })
        .map(([k, v]) => `${k} ${Buffer.from(v).toString("base64")}`)
        .join(",");
      let r = await fetch(
        `https://${ref}.storage.supabase.co/storage/v1/upload/resumable`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Upload-Length": String(data.length),
            "Upload-Metadata": metadata,
          },
        },
      );
      if (r.status !== 201) return r.status;
      const location = r.headers.get("location");
      assert.ok(
        [`${ref}.storage.supabase.co`, `${ref}.supabase.co`].includes(
          new URL(location).hostname,
        ),
      );
      let offset = 0;
      while (offset < data.length) {
        const end = Math.min(offset + 6 * 1024 * 1024, data.length);
        r = await fetch(location, {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/offset+octet-stream",
            "Upload-Offset": String(offset),
          },
          body: data.slice(offset, end),
        });
        if (r.status !== 204) return r.status;
        offset = end;
        r = await fetch(location, { method: "HEAD", headers });
        assert.equal(r.status, 200);
        assert.equal(Number(r.headers.get("upload-offset")), offset);
      }
      return 204;
    }
    assert.equal(
      JSON.parse(
        Buffer.from(
          begun.uploadGrant.accessToken.split(".")[1],
          "base64url",
        ).toString(),
      ).sub,
      a.id,
    );
    assert.ok(begun.uploadGrant.expiresAt > Date.now() / 1000);
    assert.equal(
      await tus(a, begun.uploadPath, bytes, begun.uploadGrant.accessToken),
      204,
    );
    for (const client of [a.client, b.client, anonymous])
      assert.ok(
        (
          await client.storage
            .from(templateBuckets[0])
            .download(begun.uploadPath)
        ).error,
      );
    const tooBig = input({ requestId: randomUUID() }),
      tooBigBegin = await a.templates.begin(tooBig);
    const tooBigStatus = await tus(
      a,
      tooBigBegin.uploadPath,
      await templateFixture(10000001),
    );
    assert.equal(tooBigStatus, 413);
    assert.ok(
      !(
        await admin.storage
          .from(templateBuckets[0])
          .list(a.id, { search: tooBig.requestId })
      ).data.some((x) => x.name === `${tooBig.requestId}.pdf`),
    );
    await a.templates.cancel(tooBig.requestId);
    checked("selected authenticated TUS 10MB resume and boundary+1 rejection", {
      overLimitStatus: tooBigStatus,
    });
    await deny(a.templates.commit(request.requestId), "55000");
    const validation = await a.templates.validate(request.requestId);
    assert.equal(validation.valid, true);
    assert.equal(validation.sha256, sha);
    assert.ok(
      (
        await a.client.storage
          .from(templateBuckets[1])
          .download(begun.uploadPath)
      ).error,
    );
    assert.equal(
      String(
        (
          await a.client.storage
            .from(templateBuckets[1])
            .upload(begun.uploadPath, bytes, { contentType: "application/pdf" })
        ).error?.statusCode,
      ),
      "403",
    );
    const droppedReplyAdmin = {
      storage: admin.storage,
      rpc: (name, args) => ({
        abortSignal: (signal) =>
          admin
            .rpc(name, args)
            .abortSignal(signal)
            .then((reply) => {
              if (name === "commit_template_save" && !reply.error)
                throw new Error("synthetic-response-loss");
              return reply;
            }),
      }),
    };
    const dropReply = templateInfrastructure(
      a.client,
      droppedReplyAdmin,
      url,
      secret,
    );
    await assert.rejects(
      dropReply.commit(request.requestId),
      /synthetic-response-loss/,
    );
    const saved = await a.templates.outcome(request.requestId);
    assert.equal(saved.clinicId, clinicId);
    assert.equal(saved.templateId, request.requestId);
    revision = saved.revision;
    const current = await a.client
      .from("clinics")
      .select("id::text,name,percentage,active,template_revision::text")
      .eq("id", clinicId)
      .single();
    assert.ifError(current.error);
    assert.equal(current.data.active, false);
    assert.equal(current.data.name, request.name);
    assert.deepEqual(await a.templates.commit(request.requestId), saved);
    assert.deepEqual(await a.templates.outcome(request.requestId), saved);
    assert.deepEqual((await a.templates.begin(request)).outcome, saved);
    checked(
      "real byte validation, inactive atomic publication, lost-response outcome and idempotent retry",
    );
    const read = await a.templates.read(clinicId, request.requestId);
    assert.equal(read.headers.get("Cache-Control"), "private, no-store");
    assert.equal(hash(new Uint8Array(await read.arrayBuffer())), sha);
    await deny(b.templates.read(clinicId, request.requestId), "42501");
    checked("current owner server read/hash and cross-owner read denial");
    assert.deepEqual(
      (await a.templates.cancel(request.requestId)).outcome,
      saved,
    );
    for (const bucket of templateBuckets)
      for (const client of [a.client, b.client, anonymous]) {
        assert.equal(
          String(
            (
              await client.storage
                .from(bucket)
                .update(begun.uploadPath, Buffer.from("bad"), {
                  contentType: "application/pdf",
                })
            ).error?.statusCode,
          ),
          "403",
        );
        await client.storage.from(bucket).remove([begun.uploadPath]);
        const listed = await admin.storage
          .from(bucket)
          .list(a.id, { search: request.requestId });
        assert.ifError(listed.error);
        assert.ok(
          listed.data.some((item) => item.name === `${request.requestId}.pdf`),
        );
      }
    const bBytes = await templateFixture(),
      bInput = {
        requestId: randomUUID(),
        clinicId: null,
        revision: null,
        name: "Owner B creation",
        percentage: 30,
        active: true,
        mode: "replace",
        sha256: hash(bBytes),
        bytes: bBytes.length,
      };
    const bBegin = await b.templates.begin(bInput);
    assert.ifError(
      (
        await b.client.storage
          .from(templateBuckets[0])
          .upload(
            bBegin.uploadPath,
            new Blob([bBytes], { type: "application/pdf" }),
            { contentType: "application/pdf" },
          )
      ).error,
    );
    await b.templates.validate(bInput.requestId);
    const bSaved = await b.templates.commit(bInput.requestId);
    assert.equal(
      hash(
        new Uint8Array(
          await (
            await b.templates.read(bSaved.clinicId, bInput.requestId)
          ).arrayBuffer(),
        ),
      ),
      hash(bBytes),
    );
    await deny(a.templates.read(bSaved.clinicId, bInput.requestId), "42501");
    checked(
      "both ordinary owners publish/read; all client update/delete attempts preserve listed Storage objects",
    );

    // Real invalid bytes uploaded under an acceptable MIME header never publish.
    for (const [reason, data] of [
      ["unreadable", Buffer.from("not a PDF")],
      ["missing-fields", await templateFixture(10000, true)],
    ]) {
      const invalid = input({
          revision,
          sha256: hash(data),
          bytes: data.length,
        }),
        r = await a.templates.begin(invalid);
      assert.ifError(
        (
          await a.client.storage
            .from(templateBuckets[0])
            .upload(r.uploadPath, data, { contentType: "application/pdf" })
        ).error,
      );
      assert.equal(
        (await a.templates.validate(invalid.requestId)).reason,
        reason,
      );
      await deny(a.templates.commit(invalid.requestId), "55000");
    }
    const encryptedResponse = await fetch(
      "https://raw.githubusercontent.com/Hopding/pdf-lib/93dd36e85aa659a3bca09867d2d8fac172501fbe/assets/pdfs/encrypted_old.pdf",
    );
    assert.ok(encryptedResponse.ok);
    const encrypted = new Uint8Array(await encryptedResponse.arrayBuffer());
    assert.equal(
      hash(encrypted),
      "e114c47dbb70c0ce7f0fd5bf58dec35bd638a1a3388346f4e17625ffa724c641",
    );
    const encryptedInput = input({
        revision,
        sha256: hash(encrypted),
        bytes: encrypted.length,
      }),
      encryptedBegin = await a.templates.begin(encryptedInput);
    assert.ifError(
      (
        await a.client.storage
          .from(templateBuckets[0])
          .upload(encryptedBegin.uploadPath, encrypted, {
            contentType: "application/pdf",
          })
      ).error,
    );
    assert.equal(
      (await a.templates.validate(encryptedInput.requestId)).reason,
      "encrypted",
    );
    await deny(a.templates.commit(encryptedInput.requestId), "55000");
    checked(
      "actual invalid/missing/encrypted uploads rejected without changing saved template",
    );

    const cancelInput = input({ revision }),
      cancelBegin = await a.templates.begin(cancelInput);
    assert.ifError(
      (
        await a.client.storage
          .from(templateBuckets[0])
          .upload(cancelBegin.uploadPath, bytes, {
            contentType: "application/pdf",
          })
      ).error,
    );
    await a.templates.cancel(cancelInput.requestId);
    await deny(a.templates.validate(cancelInput.requestId), "55000");
    await deny(a.templates.commit(cancelInput.requestId), "55000");
    const otherName = await a.client.from("clinics").insert({
      owner_id: a.id,
      name: "Duplicate save target",
      percentage: 10,
    });
    assert.ifError(otherName.error);
    const duplicate = input({ revision, name: "Duplicate save target" }),
      dupBegin = await a.templates.begin(duplicate);
    assert.ifError(
      (
        await a.client.storage
          .from(templateBuckets[0])
          .upload(dupBegin.uploadPath, bytes, {
            contentType: "application/pdf",
          })
      ).error,
    );
    await a.templates.validate(duplicate.requestId);
    await deny(a.templates.commit(duplicate.requestId), "23505");
    assert.equal(
      (
        await a.client
          .from("clinic_templates")
          .select("template_id")
          .eq("clinic_id", clinicId)
          .single()
      ).data.template_id,
      request.requestId,
    );
    checked(
      "Cancel and failed unique-name save preserve existing saved pair with exact SQLSTATE",
    );

    const storageFailure = input({ revision }),
      storageBegin = await a.templates.begin(storageFailure);
    assert.ifError(
      (
        await a.client.storage
          .from(templateBuckets[0])
          .upload(storageBegin.uploadPath, bytes, {
            contentType: "application/pdf",
          })
      ).error,
    );
    assert.ifError(
      (
        await admin.storage.updateBucket(templateBuckets[1], {
          ...templateBucketOptions,
          allowedMimeTypes: ["text/plain"],
        })
      ).error,
    );
    try {
      await deny(
        a.templates.validate(storageFailure.requestId),
        "storage-write",
      );
    } finally {
      assert.ifError(
        (
          await admin.storage.updateBucket(
            templateBuckets[1],
            templateBucketOptions,
          )
        ).error,
      );
    }
    await deny(a.templates.commit(storageFailure.requestId), "55000");
    assert.equal(
      (
        await a.client
          .from("clinic_templates")
          .select("template_id")
          .eq("clinic_id", clinicId)
          .single()
      ).data.template_id,
      request.requestId,
    );
    await sql(
      `update public.template_save_requests set lease_until=now()-interval '1 second' where id='${storageFailure.requestId}'`,
    );
    assert.equal(
      (await a.templates.validate(storageFailure.requestId)).valid,
      true,
    );
    await a.templates.cancel(storageFailure.requestId);
    checked(
      "actual sealed Storage failure preserves saved pair and validation retries after lease expiry",
    );
    const races = await Promise.all([
      a.templates.begin(
        input({
          revision,
          mode: "keep",
          sha256: undefined,
          bytes: undefined,
          name: "Concurrent A",
        }),
      ),
      a.templates.begin(
        input({
          revision,
          mode: "keep",
          sha256: undefined,
          bytes: undefined,
          name: "Concurrent B",
        }),
      ),
    ]);
    const raced = await Promise.allSettled(
      races.map((r) => a.templates.commit(r.requestId)),
    );
    assert.equal(raced.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(
      raced.find((r) => r.status === "rejected").reason.code,
      "PT409",
    );
    const winner = raced.find((r) => r.status === "fulfilled").value;
    revision = winner.revision;
    const winnerClinic = await a.client
      .from("clinics")
      .select("name,template_revision::text")
      .eq("id", clinicId)
      .single();
    assert.ifError(winnerClinic.error);
    assert.equal(winnerClinic.data.template_revision, revision);
    assert.ok(
      ["Concurrent A", "Concurrent B"].includes(winnerClinic.data.name),
    );
    checked(
      "real concurrent saves have one winner, SQLSTATEPT409 loser and verified winning row",
    );

    // Expiry is advanced only in disposable fixtures; production RPCs cannot set time.
    await sql(
      `update public.template_save_requests set expires_at=now()-interval '28 hours' where id='${cancelInput.requestId}'`,
    );
    const cleanupRace = await Promise.allSettled([
      admin
        .rpc("claim_template_cleanup", { p_id: cancelInput.requestId })
        .then((r) => {
          assert.ifError(r.error);
          return r.data;
        }),
      a.templates.commit(cancelInput.requestId),
    ]);
    assert.equal(cleanupRace[0].status, "fulfilled");
    assert.equal(cleanupRace[1].status, "rejected");
    assert.equal(cleanupRace[1].reason.code, "55000");
    await deny(a.templates.commit(cancelInput.requestId), "55000");
    await sql(
      `update public.template_save_requests set lease_until=now()-interval '1 second' where id='${cancelInput.requestId}'`,
    );
    await a.templates.collect(cancelInput.requestId);
    const listed = await admin.storage
      .from(templateBuckets[0])
      .list(a.id, { search: cancelInput.requestId });
    assert.ifError(listed.error);
    assert.ok(
      !listed.data.some((x) => x.name === `${cancelInput.requestId}.pdf`),
    );
    await deny(a.templates.commit(cancelInput.requestId), "55000");
    const liveCleanup = await admin.rpc("claim_template_cleanup", {
      p_id: request.requestId,
    });
    assert.equal(liveCleanup.error?.code, "55000");
    checked(
      "cleanup claim excludes publication, lease retry deletes via API/list and current template cannot be collected",
    );

    const removeInput = input({
      revision,
      mode: "remove",
      sha256: undefined,
      bytes: undefined,
      name: "Removed template",
    });
    await a.templates.begin(removeInput);
    const removed = await a.templates.commit(removeInput.requestId);
    assert.equal(removed.templateId, null);
    revision = removed.revision;
    await deny(a.templates.read(clinicId, request.requestId), "42501");
    await sql(
      `update public.template_save_requests set retired_at=now()-interval '25 hours' where id='${request.requestId}'`,
    );
    await a.templates.collect(request.requestId);
    assert.ok(
      !(
        await admin.storage
          .from(templateBuckets[1])
          .list(a.id, { search: request.requestId })
      ).data.some((x) => x.name === `${request.requestId}.pdf`),
    );
    assert.deepEqual(await a.templates.outcome(request.requestId), saved);
    checked(
      "removal revokes new reads, retired cleanup preserves idempotency outcome",
    );

    if (production) await productionProof(revision, bytes);
    result.passed = true;
  } finally {
    app?.kill();
    await api(`/projects/${ref}/postgrest`, "PATCH", { db_schema: "" });
    await writeFile(
      new URL(`../.env.template-validation-${ref}.json`, import.meta.url),
      JSON.stringify(result, null, 2),
    );
  }
  return result;
}

if (process.argv[1]?.endsWith("template-storage-validation.mjs")) {
  const { api, disposable, replay, query } =
    await import("./database-validation.mjs");
  assert.equal(
    process.env.MYCLINICS_DISPOSABLE_AUTHORIZATION,
    "njnmfutclorywskqrftd",
  );
  assert.equal((await api("/organizations/njnmfutclorywskqrftd")).plan, "free");
  await disposable("templates", async (ref) => {
    await replay(ref);
    await query(
      ref,
      `begin;${await readFile(new URL("../supabase/tests/50-private-templates.sql", import.meta.url), "utf8")}rollback;`,
    );
    await templateStorageTests({
      ref,
      api,
      query,
      production: process.argv.includes("--production"),
    });
  });
}
