import { parseDecimal } from "@/lib/components/decimal-input/parse-decimal";
import {
  monthKey,
  madridDateParts,
  type MonthlyPeriod,
} from "@/lib/monthly-scope/monthly-scope";
import { type ActivityRow, type EuroCents } from "./activity-view";

export const defaultIrpfBasisPoints = 1500;

export type ActivityDraft = Pick<
  ActivityRow,
  "date" | "clinicId" | "description" | "calculationMode" | "priceCents"
> & { directCents: EuroCents | null };

export function newActivityDate(
  period: MonthlyPeriod,
  lastEntered?: ActivityRow["date"],
  now = new Date(),
) {
  const month = monthKey(period);
  if (lastEntered?.startsWith(`${month}-`)) return lastEntered;

  const today = madridDateParts(now);
  return monthKey(today) === month
    ? `${month}-${String(today.day).padStart(2, "0")}`
    : "";
}

export function isActivityDate(date: string): date is ActivityRow["date"] {
  if (!/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return day >= 1 && day <= monthDays[month - 1];
}

export function parseActivityAmount(raw: string) {
  const parsed = parseDecimal(raw);
  if (parsed.status !== "valid") return null;
  const [integer, fraction = ""] = parsed.decimal.split(".");
  return `${BigInt(`${integer}${fraction.padEnd(2, "0")}`)}` as const;
}

export function activityAmountInput(cents: EuroCents) {
  return activityAmountDecimal(cents).replace(".", ",");
}

export function activityAmountDecimal(cents: EuroCents) {
  const digits = cents.replace(/^-/, "").padStart(3, "0");
  const sign = cents.startsWith("-") ? "-" : "";
  return `${sign}${digits.slice(0, -2)}.${digits.slice(-2)}`;
}

function roundedRate(cents: EuroCents, basisPoints: number): EuroCents {
  const product = BigInt(cents) * BigInt(basisPoints);
  // BigInt division truncates toward zero. Offset by a signed half before dividing.
  const half = BigInt(product < BigInt(0) ? -5000 : 5000);
  return `${(product + half) / BigInt(10000)}`;
}

export function activityEarnings(
  price: EuroCents,
  direct: EuroCents | null,
  percentageBasisPoints: number,
  irpfBasisPoints: number,
) {
  const grossCents = direct ?? roundedRate(price, percentageBasisPoints);
  return {
    grossCents,
    netCents: roundedRate(grossCents, 10000 - irpfBasisPoints),
  };
}
