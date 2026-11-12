import { parseDecimal } from "@/lib/components/decimal-input/parse-decimal";
import {
  activityMonthKey,
  madridDateParts,
  type ActivityPeriod,
  type ActivityRow,
  type EuroCents,
} from "./activity-view";

export const defaultIrpfBasisPoints = 1500;

export function newActivityDate(
  period: ActivityPeriod,
  lastEntered?: ActivityRow["date"],
  now = new Date(),
) {
  const month = activityMonthKey(period);
  if (lastEntered?.startsWith(`${month}-`)) return lastEntered;

  const today = madridDateParts(now);
  return activityMonthKey(today) === month
    ? `${month}-${String(today.day).padStart(2, "0")}`
    : "";
}

export function isActivityDate(date: string): date is ActivityRow["date"] {
  if (!/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

export function parseActivityAmount(raw: string) {
  const parsed = parseDecimal(raw);
  if (parsed.status !== "valid") return null;
  const [integer, fraction = ""] = parsed.decimal.split(".");
  return `${BigInt(`${integer}${fraction.padEnd(2, "0")}`)}` as const;
}

export function activityAmountInput(cents: EuroCents) {
  const digits = cents.replace(/^-/, "").padStart(3, "0");
  const sign = cents.startsWith("-") ? "-" : "";
  return `${sign}${digits.slice(0, -2)},${digits.slice(-2)}`;
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
