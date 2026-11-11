import { parseDecimal } from "@/lib/components/decimal-input/parse-decimal";

export type Clinic = {
  id: string;
  name: string;
  percentage: number;
  active: boolean;
};

export const CLINIC_NAME_MAX_LENGTH = 200;

export function isClinicId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    /^[1-9][0-9]{0,18}$/.test(id) &&
    BigInt(id) <= BigInt("9223372036854775807")
  );
}

export function countClinicNameCharacters(name: string) {
  return [...name].length;
}

export function parseClinicPercentage(raw: string) {
  return parseDecimal(raw.trim(), { min: "0", max: "100" });
}
