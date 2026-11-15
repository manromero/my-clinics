import "server-only";

import {
  isClinicId,
  parseClinicPercentage,
  type Clinic,
} from "@/lib/clinics/clinic";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseSession } from "@/lib/supabase/session";

// PostgreSQL casts bigint to text before transport, overriding only its wire ID.
export type ClinicRow = Pick<
  Database["public"]["Tables"]["clinics"]["Row"],
  "name" | "percentage" | "active"
> & { id: string };

function mapClinic(row: ClinicRow): Clinic {
  if (
    !isClinicId(row.id) ||
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

export async function listClinics() {
  const { client } = await requireSupabaseSession();
  try {
    const { data, error } = await client
      .from("clinics")
      .select("id::text,name,percentage,active")
      .order("id", { ascending: true })
      .overrideTypes<ClinicRow[], { merge: false }>();
    return error || !data ? null : data.map(mapClinic);
  } catch {
    return null;
  }
}
