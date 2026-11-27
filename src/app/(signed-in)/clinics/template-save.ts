import { createClient } from "@supabase/supabase-js";
import type { Clinic } from "@/lib/clinics/clinic";
import { validateClinicFields, type ClinicSaveResult } from "./clinic-write";
import type { TemplateIntent } from "./clinic-template-field";
import {
  beginClinicSave,
  cancelClinicSave,
  finishClinicSave,
} from "./template-actions";

// Held by ContinuityDrafts only: no file, capability or request enters web storage.
export type ClinicSaveAttempt = {
  id: string;
  signature: string;
  phase: "begin" | "finish";
};
type Attempts = {
  current: ClinicSaveAttempt | null;
  set: (value: ClinicSaveAttempt | null) => void;
};

export async function cancelTemplateAttempt(attempts: Attempts) {
  if (!attempts.current)
    return { status: "cancelled" as const, cleanupPending: false };
  const result = await cancelClinicSave(attempts.current.id);
  if (result.status === "cancelled" && !result.cleanupPending)
    attempts.set(null);
  return result;
}

export async function saveClinicTemplate(
  data: FormData,
  intent: TemplateIntent,
  clinic: Clinic | undefined,
  attempts: Attempts,
): Promise<ClinicSaveResult> {
  const checked = validateClinicFields(data);
  if (checked.status === "invalid") return checked;
  const file = intent.kind === "replace" ? intent.file : undefined;
  const sha256 = file
    ? Array.from(
        new Uint8Array(
          await crypto.subtle.digest("SHA-256", await file.arrayBuffer()),
        ),
        (b) => b.toString(16).padStart(2, "0"),
      ).join("")
    : undefined;
  const input = {
    clinicId: clinic?.id ?? null,
    revision: clinic?.revision ?? null,
    name: checked.name,
    percentage: checked.percentage,
    active: clinic ? data.get("active") === "active" : true,
    mode: intent.kind,
    filename: file?.name,
    bytes: file?.size,
    sha256,
  };
  const signature = JSON.stringify(input);
  let attempt = attempts.current;
  if (
    attempt &&
    (attempt.signature !== signature || attempt.phase === "begin")
  ) {
    const cancelled = await cancelTemplateAttempt(attempts);
    if (cancelled.status === "saved")
      return {
        status: "failed",
        message:
          "El intento anterior ya se guardó. Estos cambios nuevos siguen sin guardar. Conserva los datos que necesites y cierra el formulario para revisar la clínica guardada antes de editarla.",
      };
    if (cancelled.status === "failed" || cancelled.cleanupPending)
      return {
        status: "failed",
        message:
          "No se pudo confirmar la cancelación del intento anterior. Reintenta para comprobar su resultado.",
      };
    attempt = null;
  }
  if (!attempt) {
    attempt = { id: crypto.randomUUID(), signature, phase: "begin" };
    attempts.set(attempt);
    const begun = await beginClinicSave({ ...input, requestId: attempt.id });
    if (begun.status !== "ready") return begun;
    if (file) {
      const { uploadGrant, uploadPath } = begun.reservation;
      if (!uploadGrant || !uploadPath) return { status: "failed" };
      const storage = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        },
      ).storage;
      const uploaded = await storage
        .from("clinic-templates")
        .uploadToSignedUrl(uploadPath, uploadGrant.token, file, {
          contentType: "application/pdf",
          upsert: false,
        });
      if (uploaded.error)
        return {
          status: "failed",
          message:
            "No se pudo subir el PDF. La clínica y su plantilla guardada se conservan. Reintenta.",
        };
    }
    attempt = { ...attempt, phase: "finish" };
    attempts.set(attempt);
  }
  const result = await finishClinicSave(attempt.id);
  if (result.status === "saved" && !result.cleanupPending) attempts.set(null);
  if (
    (result.status === "failed" || result.status === "invalid") &&
    result.reset
  ) {
    const cancelled = await cancelTemplateAttempt(attempts);
    if (cancelled.status === "saved") return cancelled;
  }
  return result;
}
