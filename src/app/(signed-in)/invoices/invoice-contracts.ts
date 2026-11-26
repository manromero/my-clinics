import { parseDecimal } from "@/lib/components/decimal-input/parse-decimal";

export type InvoiceInputs = { number: string; date: string; gross: string };
export type InvoiceClinic = {
  id: string;
  name: string;
  active: boolean;
  templateName: string | null;
};
export type InvoiceClinicState =
  | { status: "unavailable" }
  | { status: "loading" }
  | { status: "failure" }
  | { status: "ready"; clinics: InvoiceClinic[] };

export function validInvoiceNumber(value: string) {
  return /^\d{1,4}$/.test(value) && /[1-9]/.test(value);
}

export function validIssueDate(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
  const [day, month, year] = value.split("/").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return (
    year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
  );
}

export function madridToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);
}

export function formatInvoiceCents(cents: bigint) {
  const integer = (cents / BigInt(100))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${integer},${(cents % BigInt(100)).toString().padStart(2, "0")} €`;
}

// These are the only five fillable fields. Invalid inputs never reach PDF output.
export function invoiceFields(inputs: InvoiceInputs) {
  const parsed = parseDecimal(inputs.gross, {
    allowNegative: false,
    min: "0.01",
  });
  let gross = "",
    withholding = "",
    net = "";
  if (parsed.status === "valid") {
    const [integer, fraction = ""] = parsed.decimal.split(".");
    const cents =
      BigInt(integer) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
    const retained = (cents * BigInt(15) + BigInt(50)) / BigInt(100);
    gross = formatInvoiceCents(cents);
    withholding = formatInvoiceCents(retained);
    net = formatInvoiceCents(cents - retained);
  }
  return {
    invoice_number: validInvoiceNumber(inputs.number) ? inputs.number : "",
    issue_date: validIssueDate(inputs.date) ? inputs.date : "",
    gross_amount: gross,
    withholding_amount: withholding,
    net_amount: net,
  };
}
