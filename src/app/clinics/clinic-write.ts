import {
  CLINIC_NAME_MAX_LENGTH,
  countClinicNameCharacters,
  parseClinicPercentage,
} from "@/lib/clinics/clinic";

type InvalidClinicFields = {
  status: "invalid";
  nameError?: string;
  percentageError?: string;
};

export type ClinicSaveResult =
  { status: "saved" | "failed" | "missing" } | InvalidClinicFields;

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

export function validateClinicFields(
  formData: FormData,
): InvalidClinicFields | { status: "valid"; name: string; percentage: number } {
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
  return { status: "valid", name, percentage: Number(percentage.decimal) };
}

export function clinicWriteError(error: { code: string; message: string }) {
  if (
    error.code === "23514" &&
    error.message.includes('"clinics_name_length"')
  ) {
    return { status: "invalid", nameError: nameLengthError } as const;
  }
  if (
    error.code === "23505" &&
    error.message.includes('"clinics_name_key_unique"')
  ) {
    return {
      status: "invalid",
      nameError: "Ya existe una clínica con ese nombre.",
    } as const;
  }
  return { status: "failed" } as const;
}
