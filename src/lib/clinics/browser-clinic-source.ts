import type { Clinic } from "@/lib/clinics/clinic";
import { parseClinicPercentage } from "@/lib/clinics/clinic";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { Database } from "@/lib/supabase/database.types";
import { createClinicService } from "./clinic-service";

// PostgreSQL casts bigint to text before transport, overriding only its wire ID.
export type ClinicRow = Omit<
  Database["public"]["Tables"]["clinics"]["Row"],
  "id"
> & { id: string };

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

export function createBrowserClinicSource(
  getClient = getSupabaseBrowserClient,
) {
  return createClinicService({
    async list() {
      const client = getClient();
      if (!client) return { status: "failed" };
      const { data, error } = await client
        .from("clinics")
        .select("id::text,name,percentage,active")
        .order("id", { ascending: true })
        .overrideTypes<ClinicRow[], { merge: false }>();
      if (error || !data) return { status: "failed" };
      return { status: "loaded", clinics: data.map(mapClinic) };
    },
  });
}
