import type { ClinicRepository } from "@/lib/clinics/clinic-repository";
import type { Clinic } from "@/lib/clinics/clinic";
import { parseClinicPercentage } from "@/lib/clinics/clinic";
import type { Database } from "@/lib/supabase/database.types";

// PostgreSQL casts bigint to text before transport, overriding only its wire ID.
export type ClinicRow = Omit<
  Database["public"]["Tables"]["clinics"]["Row"],
  "id"
> & { id: string };
export type ClinicClient = { listClinics(): Promise<readonly ClinicRow[]> };

export function mapClinic(row: ClinicRow): Clinic {
  if (
    typeof row.id !== "string" ||
    !/^[1-9]\d*$/.test(row.id) ||
    BigInt(row.id) > BigInt("9223372036854775807") ||
    typeof row.name !== "string" ||
    !row.name.trim() ||
    typeof row.percentage !== "number" ||
    parseClinicPercentage(String(row.percentage)).status !== "valid" ||
    typeof row.active !== "boolean"
  )
    throw new Error("Invalid clinic row");
  return {
    id: row.id,
    name: row.name,
    percentage: row.percentage,
    active: row.active,
  };
}

export function createSupabaseClinicRepository(
  client: ClinicClient,
): ClinicRepository {
  return {
    async list() {
      try {
        return {
          status: "loaded",
          clinics: (await client.listClinics()).map(mapClinic),
        };
      } catch {
        return { status: "failed" };
      }
    },
  };
}
