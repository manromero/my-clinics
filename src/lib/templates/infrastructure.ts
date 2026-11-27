import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import { templateByteLimit, validateTemplatePdf } from "./pdf-validation.ts";

export const templateBucket = "clinic-templates";
export const templateBucketOptions = {
  public: false,
  fileSizeLimit: templateByteLimit,
  allowedMimeTypes: ["application/pdf"],
};
type Client = SupabaseClient<Database>;
export type TemplateSaveInput = {
  requestId: string;
  clinicId: string | null;
  revision: string | null;
  name: string;
  percentage: number;
  active: boolean;
  mode: "keep" | "replace" | "remove";
  filename?: string;
  sha256?: string;
  bytes?: number;
};
type RecordValue = {
  id: string;
  owner_id: string;
  state: string;
  mode: string;
  expires_at: string;
  lease_id: string | null;
  expected_sha256: string | null;
  expected_bytes: number | null;
  sha256: string | null;
  byte_count: number | null;
  outcome: unknown;
};
export class TemplateError extends Error {
  code: string;
  constructor(code: string, message = "Template operation failed") {
    super(message);
    this.code = code;
  }
}
function record(value: unknown): RecordValue {
  if (
    !value ||
    typeof value !== "object" ||
    !("id" in value) ||
    !("owner_id" in value)
  )
    throw new TemplateError("invalid-response");
  return value as RecordValue;
}
const key = (r: RecordValue) => `${r.owner_id}/${r.id}.pdf`;

export async function boundedTemplateBytes(
  response: Response,
): Promise<Uint8Array> {
  if (!response.ok || !response.body) throw new TemplateError("storage-read");
  const length = response.headers.get("content-length");
  if (length && Number(length) > templateByteLimit) {
    await response.body.cancel();
    throw new TemplateError("too-large");
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > templateByteLimit) throw new TemplateError("too-large");
      chunks.push(part.value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of chunks) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }
  return bytes;
}

// Both clients are server-only. Auth is verified afresh for each owner operation;
// no caller-provided owner, object path or validation boolean is accepted.
export function templateInfrastructure(
  auth: Client,
  admin: Client,
  projectUrl: string,
  secret: string,
) {
  const url = new URL(projectUrl);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/"
  )
    throw new TemplateError("configuration");
  async function rpc(
    name: keyof Database["public"]["Functions"],
    args: Record<string, unknown>,
    timeout = 30000,
  ) {
    // Generated Postgres RPC types do not express nullable scalar arguments.
    const result = await admin
      .rpc(name, args as never)
      .abortSignal(AbortSignal.timeout(timeout));
    if (result.error)
      throw new TemplateError(result.error.code || "rpc-unavailable");
    return result.data as unknown;
  }
  async function owner() {
    const result = await auth.auth.getUser();
    if (result.error || !result.data.user)
      throw new TemplateError("unauthenticated");
    return result.data.user.id;
  }
  async function storageRead(bucket: string, path: string) {
    return fetch(
      `${url.origin}/storage/v1/object/authenticated/${bucket}/${path}`,
      {
        headers: { apikey: secret, Authorization: `Bearer ${secret}` },
        cache: "no-store",
        signal: AbortSignal.timeout(120000),
      },
    );
  }
  async function remove(path: string) {
    const headers = {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    };
    const deleted = await fetch(
      `${url.origin}/storage/v1/object/${templateBucket}`,
      {
        method: "DELETE",
        headers,
        body: JSON.stringify({ prefixes: [path] }),
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!deleted.ok) throw new TemplateError("storage-delete");
    const [folder, filename] = path.split("/");
    const listing = await fetch(
      `${url.origin}/storage/v1/object/list/${templateBucket}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          prefix: folder + "/",
          search: filename,
          limit: 100,
        }),
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!listing.ok) throw new TemplateError("storage-delete-unconfirmed");
    const objects: { name: string }[] = await listing.json();
    if (objects.some((item) => item.name === filename))
      throw new TemplateError("storage-delete-unconfirmed");
  }
  async function cleanup(ownerId: string, requestId: string): Promise<boolean> {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = record(
          await rpc(
            "claim_template_cleanup",
            { p_owner: ownerId, p_id: requestId },
            5000,
          ),
        );
        await remove(key(r));
        return true;
      } catch {
        // Retry only this operation's affected object, never scan another file.
      }
    }
    return false;
  }
  async function savedOutcome(ownerId: string, outcome: unknown) {
    if (outcome === null) return null;
    if (!outcome || typeof outcome !== "object")
      throw new TemplateError("invalid-response");
    const retired =
      "retiredTemplateId" in outcome ? outcome.retiredTemplateId : null;
    const cleaned =
      typeof retired !== "string" || (await cleanup(ownerId, retired));
    return { ...outcome, cleanupPending: !cleaned };
  }
  return {
    async cleanupAffected(requestId: string) {
      return cleanup(await owner(), requestId);
    },
    async begin(input: TemplateSaveInput) {
      const ownerId = await owner();
      const r = record(
        await rpc("begin_template_save", {
          p_owner: ownerId,
          p_id: input.requestId,
          p_clinic: input.clinicId,
          p_revision: input.revision,
          p_name: input.name,
          p_percentage: input.percentage,
          p_active: input.active,
          p_mode: input.mode,
          p_filename: input.filename ?? null,
          p_sha256: input.sha256 ?? null,
          p_bytes: input.bytes ?? null,
        }),
      );
      let uploadGrant: {
        token: string;
        expiresAt: number;
        transport: "signed-standard";
      } | null = null;
      if (r.mode === "replace" && r.state === "pending") {
        const reservationExpiry = Date.parse(r.expires_at);
        if (
          !Number.isFinite(reservationExpiry) ||
          reservationExpiry <= Date.now()
        )
          throw new TemplateError("55000", "Upload reservation expired");
        const capability = await admin.storage
          .from(templateBucket)
          .createSignedUploadUrl(key(r), { upsert: false });
        if (capability.error || !capability.data?.token)
          throw new TemplateError("upload-capability");
        if (reservationExpiry <= Date.now())
          throw new TemplateError("55000", "Upload reservation expired");
        const claims = JSON.parse(
          Buffer.from(
            capability.data.token.split(".")[1],
            "base64url",
          ).toString(),
        ) as {
          url?: string;
          upsert?: boolean;
          exp?: number;
          role?: string;
          sub?: string;
        };
        if (
          claims.url !== `${templateBucket}/${key(r)}` ||
          claims.upsert !== false ||
          claims.role ||
          claims.sub ||
          !Number.isSafeInteger(claims.exp) ||
          claims.exp! <= Date.now() / 1000
        )
          throw new TemplateError("upload-capability");
        uploadGrant = {
          token: capability.data.token,
          expiresAt: claims.exp!,
          transport: "signed-standard",
        };
      }
      return {
        requestId: r.id,
        state: r.state,
        outcome: r.outcome,
        uploadPath: r.mode === "replace" ? key(r) : null,
        uploadGrant,
      };
    },
    async outcome(requestId: string) {
      const ownerId = await owner();
      const r = record(
        await rpc("template_request", { p_owner: ownerId, p_id: requestId }),
      );
      return savedOutcome(ownerId, r.outcome);
    },
    async cancel(requestId: string) {
      const ownerId = await owner();
      const r = record(
        await rpc("cancel_template_save", {
          p_owner: ownerId,
          p_id: requestId,
        }),
      );
      if (r.outcome !== null) {
        const outcome = await savedOutcome(ownerId, r.outcome);
        return {
          state: r.state,
          outcome,
          cleanupPending: outcome?.cleanupPending ?? false,
        };
      }
      const cleaned =
        r.state !== "cancelled" ||
        r.mode !== "replace" ||
        (await cleanup(ownerId, requestId));
      return { state: r.state, outcome: r.outcome, cleanupPending: !cleaned };
    },
    async validate(requestId: string) {
      const ownerId = await owner();
      const r = record(
        await rpc("claim_template_validation", {
          p_owner: ownerId,
          p_id: requestId,
        }),
      );
      if (r.state === "ready" || r.state === "saved") return;
      const bytes = await boundedTemplateBytes(
        await storageRead(templateBucket, key(r)),
      );
      const validated = await validateTemplatePdf(bytes);
      if (!validated.valid) {
        await rpc("cancel_template_save", {
          p_owner: ownerId,
          p_id: requestId,
        });
        const cleaned = await cleanup(ownerId, requestId);
        return { ...validated, cleanupPending: !cleaned };
      }
      if (
        validated.sha256 !== r.expected_sha256 ||
        validated.bytes !== r.expected_bytes
      ) {
        await rpc("cancel_template_save", {
          p_owner: ownerId,
          p_id: requestId,
        });
        await cleanup(ownerId, requestId);
        throw new TemplateError("identity-mismatch");
      }
      await rpc("finish_template_validation", {
        p_owner: ownerId,
        p_id: requestId,
        p_lease: r.lease_id,
        p_sha256: validated.sha256,
        p_bytes: validated.bytes,
        p_validator: validated.validator,
      });
      return validated;
    },
    async commit(requestId: string) {
      const ownerId = await owner();
      try {
        const outcome = await rpc("commit_template_save", {
          p_owner: ownerId,
          p_id: requestId,
        });
        return savedOutcome(ownerId, outcome);
      } catch (error) {
        if (
          error instanceof TemplateError &&
          ["PT409", "23505"].includes(error.code)
        ) {
          const cancelled = await rpc("cancel_template_save", {
            p_owner: ownerId,
            p_id: requestId,
          })
            .then(record)
            .catch(() => null);
          if (cancelled?.mode === "replace") await cleanup(ownerId, requestId);
        }
        // Unknown transport outcomes remain retryable with the same request ID.
        throw error;
      }
    },
    async read(clinicId: string, templateId: string) {
      const r = record(
        await rpc("read_clinic_template", {
          p_owner: await owner(),
          p_clinic: clinicId,
          p_template: templateId,
        }),
      );
      const upstream = await storageRead(templateBucket, key(r));
      if (!upstream.ok || !upstream.body)
        throw new TemplateError("storage-read");
      return new Response(upstream.body, {
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "private, no-store",
          "X-Template-Id": r.id,
          "X-Template-SHA256": r.sha256!,
          "Content-Length": String(r.byte_count),
          "X-Content-Type-Options": "nosniff",
        },
      });
    },
  };
}
