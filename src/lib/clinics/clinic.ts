import { parseDecimal } from "@/lib/components/decimal-input/parse-decimal";

export type Clinic = {
  id: string;
  name: string;
  percentage: number;
  active: boolean;
};

export function parseClinicPercentage(raw: string) {
  return parseDecimal(raw.trim(), { min: "0", max: "100" });
}
