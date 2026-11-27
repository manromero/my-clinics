"use server";

import { revalidatePath } from "next/cache";
import { requireSupabaseActionSession } from "@/lib/supabase/session";
import { createTemplateServer } from "@/lib/templates/server";
import {
  TemplateError,
  type TemplateSaveInput,
} from "@/lib/templates/infrastructure";
import { validateClinicFields } from "./clinic-write";
import { templateRejection } from "@/lib/templates/rejection";

function invalidate() {
  for (const path of ["/clinics", "/activity", "/summary", "/invoices"])
    revalidatePath(path);
}
function failure(error: unknown) {
  const code = error instanceof TemplateError ? error.code : "unknown";
  return {
    status: "failed" as const,
    message:
      code === "PT409"
        ? "Otra sesión ha cambiado esta clínica. Cierra y vuelve a abrir el formulario para revisar los datos actuales."
        : code === "23505"
          ? "Ya existe una clínica con ese nombre. Corrige el nombre y reintenta."
          : "No se pudo completar la operación. Conservamos tus datos para reintentar.",
    reset: ["PT409", "23505", "55000", "22023", "identity-mismatch"].includes(
      code,
    ),
  };
}

export async function beginClinicSave(input: TemplateSaveInput) {
  const { client } = await requireSupabaseActionSession();
  const server = createTemplateServer(client);
  if (!server) return failure(null);
  const fields = new FormData();
  fields.set("name", typeof input.name === "string" ? input.name : "");
  fields.set("percentage", String(input.percentage));
  const checked = validateClinicFields(fields);
  if (checked.status === "invalid") return checked;
  try {
    return { status: "ready" as const, reservation: await server.begin(input) };
  } catch (error) {
    return failure(error);
  }
}

export async function finishClinicSave(requestId: string) {
  const { client } = await requireSupabaseActionSession();
  const server = createTemplateServer(client);
  if (!server) return failure(null);
  try {
    let outcome = await server.outcome(requestId);
    if (!outcome) {
      try {
        const validation = await server.validate(requestId);
        if (validation && !validation.valid)
          return {
            status: "failed" as const,
            message: templateRejection(validation),
            reset: true,
          };
      } catch (error) {
        // Validation has not committed anything. Retire this attempt so retries
        // need not wait for a lost parser/download lease.
        await server.cancel(requestId);
        return { ...failure(error), reset: true };
      }
      outcome = await server.commit(requestId);
    }
    if (!outcome) return failure(null);
    invalidate();
    return { status: "saved" as const, cleanupPending: outcome.cleanupPending };
  } catch (error) {
    if (error instanceof TemplateError && error.code === "23505")
      return {
        status: "invalid" as const,
        nameError: "Ya existe una clínica con ese nombre.",
        reset: true,
      };
    return failure(error);
  }
}

export async function cancelClinicSave(requestId: string) {
  const { client } = await requireSupabaseActionSession();
  const server = createTemplateServer(client);
  if (!server) return failure(null);
  try {
    const result = await server.cancel(requestId);
    if (result.outcome) {
      invalidate();
      return {
        status: "saved" as const,
        cleanupPending: result.outcome.cleanupPending,
      };
    }
    return {
      status: "cancelled" as const,
      cleanupPending: result.cleanupPending,
    };
  } catch (error) {
    if (error instanceof TemplateError && error.code === "42501")
      return { status: "cancelled" as const, cleanupPending: false };
    return failure(error);
  }
}
