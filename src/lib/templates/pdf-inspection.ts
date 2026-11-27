import { EncryptedPDFError, PDFDocument, PDFTextField } from "pdf-lib";
import {
  requiredTemplateFields,
  templateByteLimit,
  type PdfValidation,
} from "./pdf-contract";

export type LocalPdfValidation =
  { valid: true } | Exclude<PdfValidation, { valid: true }>;

// Advisory local check. Persistence must still use the bounded authoritative validator.
export async function inspectTemplatePdf(
  bytes: Uint8Array,
): Promise<LocalPdfValidation> {
  if (bytes.byteLength > templateByteLimit)
    return { valid: false, reason: "too-large" };
  try {
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: false });
    if (pdf.isEncrypted) return { valid: false, reason: "encrypted" };
    if (!pdf.getPageCount()) return { valid: false, reason: "unreadable" };
    const form = pdf.getForm();
    const missing = requiredTemplateFields.filter(
      (name) => !form.getFieldMaybe(name),
    );
    const wrong = requiredTemplateFields.filter((name) => {
      const field = form.getFieldMaybe(name);
      return field && !(field instanceof PDFTextField);
    });
    if (missing.length)
      return { valid: false, reason: "missing-fields", fields: missing };
    if (wrong.length)
      return { valid: false, reason: "wrong-field-type", fields: wrong };
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      reason:
        error instanceof Error &&
        error.message === new EncryptedPDFError().message
          ? "encrypted"
          : "unreadable",
    };
  }
}
