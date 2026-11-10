"use server";

import { revalidatePath } from "next/cache";
import { parseClinicPercentage } from "@/lib/clinics/clinic";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type CreateClinicResult =
  | { status: "saved" | "failed" }
  | { status: "invalid"; nameError?: string; percentageError?: string };

function percentageMessage(result: ReturnType<typeof parseClinicPercentage>) {
  switch (result.status) {
    case "valid":
      return undefined;
    case "empty":
      return "Introduce el porcentaje por defecto.";
    case "incomplete":
      return "Introduce un porcentaje válido.";
    case "invalid":
      switch (result.reason) {
        case "precision":
          return "Usa como máximo dos decimales.";
        case "min":
        case "max":
          return "Introduce un porcentaje entre 0 y 100.";
        default:
          return "Introduce un porcentaje válido.";
      }
  }
}

export async function createClinic(
  formData: FormData,
): Promise<CreateClinicResult> {
  const rawName = formData.get("name");
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const rawPercentage = formData.get("percentage");
  const percentage = parseClinicPercentage(
    typeof rawPercentage === "string" ? rawPercentage : "",
  );

  if (!name || percentage.status !== "valid") {
    return {
      status: "invalid",
      nameError: name ? undefined : "Introduce el nombre de la clínica.",
      percentageError: percentageMessage(percentage),
    };
  }

  const client = createSupabaseServerClient();
  if (!client) return { status: "failed" };

  try {
    const { error } = await client
      .from("clinics")
      .insert({ name, percentage: Number(percentage.decimal) });

    if (error) {
      if (
        error.code === "23505" &&
        error.message.includes('"clinics_name_key_unique"')
      ) {
        return {
          status: "invalid",
          nameError: "Ya existe una clínica con ese nombre.",
        };
      }
      return { status: "failed" };
    }
  } catch {
    return { status: "failed" };
  }

  revalidatePath("/clinics");
  return { status: "saved" };
}
