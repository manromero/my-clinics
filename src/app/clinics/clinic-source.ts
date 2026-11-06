import { parseDecimal } from "@/lib/components/decimal-input/parse-decimal";

type ClinicDetails = { name: string; percentage: number };
type ClinicChanges = ClinicDetails & { active: boolean };

export type Clinic = ClinicChanges & { id: string };

export type ClinicSaveResult =
  | { status: "saved"; clinic: Clinic }
  | { status: "invalid"; field: keyof ClinicDetails }
  | { status: "duplicate-name" | "failed" };

export type ClinicSource = {
  list(): Promise<
    { status: "loaded"; clinics: readonly Clinic[] } | { status: "failed" }
  >;
  create(details: ClinicDetails): Promise<ClinicSaveResult>;
  update(id: string, changes: ClinicChanges): Promise<ClinicSaveResult>;
};

export function parseClinicPercentage(raw: string) {
  return parseDecimal(raw.trim(), { min: "0", max: "100" });
}
