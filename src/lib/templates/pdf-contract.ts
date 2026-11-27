export const templateByteLimit = 10_000_000;
export const templateValidatorVersion = "pdf-lib@1.17.1/text-fields-v1";
export const requiredTemplateFields = [
  "invoice_number",
  "issue_date",
  "gross_amount",
  "withholding_amount",
  "net_amount",
];
export type PdfValidation =
  | { valid: true; sha256: string; bytes: number; validator: string }
  | {
      valid: false;
      reason:
        | "too-large"
        | "encrypted"
        | "unreadable"
        | "missing-fields"
        | "wrong-field-type";
      fields?: string[];
    };
