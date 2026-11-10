"use server";

import { revalidatePath } from "next/cache";
import {
  CLINIC_NAME_MAX_LENGTH,
  countClinicNameCharacters,
  parseClinicPercentage,
} from "@/lib/clinics/clinic";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type CreateClinicResult =
  | { status: "saved" | "failed" }
  | { status: "invalid"; nameError?: string; percentageError?: string };

const nameLengthError = `El nombre de la clínica debe tener como máximo ${CLINIC_NAME_MAX_LENGTH} caracteres.`;

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
  const nameField = formData.get("name");
  const rawName = typeof nameField === "string" ? nameField : "";
  const name = rawName.trim();
  let nameError: string | undefined;
  if (countClinicNameCharacters(rawName) > CLINIC_NAME_MAX_LENGTH) {
    nameError = nameLengthError;
  } else if (!name) {
    nameError = "Introduce el nombre de la clínica.";
  }
  const rawPercentage = formData.get("percentage");
  const percentage = parseClinicPercentage(
    typeof rawPercentage === "string" ? rawPercentage : "",
  );

  if (nameError || percentage.status !== "valid") {
    return {
      status: "invalid",
      nameError,
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
        error.code === "23514" &&
        error.message.includes('"clinics_name_length"')
      ) {
        return { status: "invalid", nameError: nameLengthError };
      }
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
