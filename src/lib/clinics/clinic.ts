import { parseDecimal } from "@/lib/components/decimal-input/parse-decimal";

export type Clinic = {
  id: string;
  name: string;
  percentage: number;
  active: boolean;
};

export const CLINIC_NAME_MAX_LENGTH = 200;

export function countClinicNameCharacters(name: string) {
  return [...name].length;
}

export function parseClinicPercentage(raw: string) {
  return parseDecimal(raw.trim(), { min: "0", max: "100" });
}
