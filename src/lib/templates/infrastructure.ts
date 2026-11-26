import "server-only";

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import { templateByteLimit, validateTemplatePdf } from "./pdf-validation.ts";

export const templateBuckets = [
  "clinic-template-quarantine",
  "clinic-template-sealed",
] as const;
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
  ) {
    // Generated Postgres RPC types do not express nullable scalar arguments.
    const result = await admin
      .rpc(name, args as never)
      .abortSignal(AbortSignal.timeout(30000));
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
  async function remove(bucket: string, path: string) {
    const result = await admin.storage.from(bucket).remove([path]);
    if (result.error) throw new TemplateError("storage-delete");
    const [folder, filename] = path.split("/");
    const listing = await admin.storage
      .from(bucket)
      .list(folder, { search: filename, limit: 100 });
    if (listing.error || listing.data?.some((item) => item.name === filename))
      throw new TemplateError("storage-delete-unconfirmed");
  }
  return {
    async begin(input: TemplateSaveInput) {
      const r = record(
        await rpc("begin_template_save", {
          p_owner: await owner(),
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
        endpoint: string;
        transport: "signed-tus";
      } | null = null;
      if (r.mode === "replace" && r.state === "pending") {
        const capability = await admin.storage
          .from(templateBuckets[0])
          .createSignedUploadUrl(key(r), { upsert: false });
        if (capability.error || !capability.data?.token)
          throw new TemplateError("upload-capability");
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
          claims.url !== `${templateBuckets[0]}/${key(r)}` ||
          claims.upsert !== false ||
          claims.role ||
          claims.sub ||
          !Number.isSafeInteger(claims.exp) ||
          claims.exp! <= Date.now() / 1000
        )
          throw new TemplateError("upload-capability");
        const uploadOrigin = url.hostname.endsWith(".supabase.co")
          ? `${url.protocol}//${url.hostname.replace(".supabase.co", ".storage.supabase.co")}`
          : url.origin;
        uploadGrant = {
          token: capability.data.token,
          expiresAt: claims.exp!,
          endpoint: `${uploadOrigin}/storage/v1/upload/resumable/sign`,
          transport: "signed-tus",
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
      return record(
        await rpc("template_request", {
          p_owner: await owner(),
          p_id: requestId,
        }),
      ).outcome;
    },
    async cancel(requestId: string) {
      const r = record(
        await rpc("cancel_template_save", {
          p_owner: await owner(),
          p_id: requestId,
        }),
      );
      return { state: r.state, outcome: r.outcome };
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
        await storageRead(templateBuckets[0], key(r)),
      );
      const validated = await validateTemplatePdf(bytes);
      if (!validated.valid) {
        await rpc("cancel_template_save", {
          p_owner: ownerId,
          p_id: requestId,
        });
        return validated;
      }
      if (
        validated.sha256 !== r.expected_sha256 ||
        validated.bytes !== r.expected_bytes
      )
        throw new TemplateError("identity-mismatch");
      const uploaded = await admin.storage
        .from(templateBuckets[1])
        .upload(key(r), bytes, {
          contentType: "application/pdf",
          cacheControl: "0",
          upsert: false,
        });
      if (uploaded.error) {
        if (String(uploaded.error.statusCode) !== "409")
          throw new TemplateError("storage-write");
        // A worker may have sealed the same immutable request before losing its
        // response/lease. Recover only the exact request-bound validated bytes.
        const existing = await boundedTemplateBytes(
          await storageRead(templateBuckets[1], key(r)),
        );
        if (
          existing.length !== validated.bytes ||
          createHash("sha256").update(existing).digest("hex") !==
            validated.sha256
        )
          throw new TemplateError("sealed-identity-mismatch");
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
      return rpc("commit_template_save", {
        p_owner: await owner(),
        p_id: requestId,
      });
    },
    async read(clinicId: string, templateId: string) {
      const r = record(
        await rpc("read_clinic_template", {
          p_owner: await owner(),
          p_clinic: clinicId,
          p_template: templateId,
        }),
      );
      const upstream = await storageRead(templateBuckets[1], key(r));
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
    // Operator-only: no route/action exports this method. Daily invocation is
    // required; terminal state + leases serialize it with publication.
    async collect(requestId: string) {
      let r: RecordValue | null = null;
      try {
        r = record(await rpc("claim_template_cleanup", { p_id: requestId }));
      } catch (error) {
        if (!(error instanceof TemplateError) || error.code !== "55000")
          throw error;
      }
      if (r) {
        await remove(templateBuckets[0], key(r));
        await remove(templateBuckets[1], key(r));
        await rpc("finish_template_cleanup", {
          p_id: r.id,
          p_lease: r.lease_id,
        });
      }
      try {
        const stage = record(
          await rpc("template_quarantine_cleanup", {
            p_id: requestId,
            p_finished: false,
          }),
        );
        await remove(templateBuckets[0], key(stage));
        await rpc("template_quarantine_cleanup", {
          p_id: requestId,
          p_finished: true,
        });
      } catch (error) {
        if (!(error instanceof TemplateError) || error.code !== "55000")
          throw error;
      }
    },
    async cleanupCandidates() {
      const result = await rpc("list_template_cleanup", {});
      if (!Array.isArray(result) || result.some((id) => typeof id !== "string"))
        throw new TemplateError("invalid-response");
      return result as string[];
    },
  };
}
