import type { PdfValidation } from "./pdf-contract";

export function templateRejection(
  result: Exclude<PdfValidation, { valid: true }>,
) {
  switch (result.reason) {
    case "too-large":
      return "El PDF supera el máximo de 10.000.000 bytes (10 MB).";
    case "encrypted":
      return "El PDF está cifrado o protegido con contraseña. Usa un PDF sin protección.";
    case "missing-fields":
      return `Faltan campos de texto: ${result.fields?.join(", ")}.`;
    case "wrong-field-type":
      return `Estos campos deben ser de texto: ${result.fields?.join(", ")}.`;
    case "unreadable":
      return "No se puede leer este PDF rellenable. Selecciona otro archivo o vuelve a intentarlo.";
  }
}
