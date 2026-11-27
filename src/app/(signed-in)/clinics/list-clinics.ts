import "server-only";

import {
  isClinicId,
  parseClinicPercentage,
  type Clinic,
} from "@/lib/clinics/clinic";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseSession } from "@/lib/supabase/session";

// PostgreSQL casts bigint values to text before transport.
export type ClinicRow = Pick<
  Database["public"]["Tables"]["clinics"]["Row"],
  "name" | "percentage" | "active"
> & {
  id: string;
  template_revision: string;
};
function mapClinic(row: ClinicRow, template?: Clinic["template"]): Clinic {
  if (
    !isClinicId(row.id) ||
    typeof row.name !== "string" ||
    !row.name.trim() ||
    typeof row.percentage !== "number" ||
    parseClinicPercentage(String(row.percentage)).status !== "valid" ||
    typeof row.active !== "boolean" ||
    !isClinicId(row.template_revision) ||
    (template &&
      (!/^[0-9a-f-]{36}$/i.test(template.id) ||
        typeof template.name !== "string"))
  )
    throw new Error("Invalid clinic row");
  return {
    id: row.id,
    name: row.name,
    percentage: row.percentage,
    active: row.active,
    revision: row.template_revision,
    template,
  };
}
export async function listClinics() {
  const { client } = await requireSupabaseSession();
  try {
    const { data, error } = await client
      .from("clinics")
      .select("id::text,name,percentage,active,template_revision::text")
      .order("id", { ascending: true })
      .overrideTypes<ClinicRow[], { merge: false }>();
    if (error || !data) return null;
    const clinics = data.map((row) => mapClinic(row));
    if (!clinics.length) return [];
    // Embedded joins require non-readable owner columns. Use the existing
    // owner-scoped column grants rather than widening database privileges.
    const links = await client
      .from("clinic_templates")
      .select("clinic_id::text,template_id")
      .filter("clinic_id", "in", `(${clinics.map((row) => row.id).join(",")})`)
      .overrideTypes<
        { clinic_id: string; template_id: string }[],
        { merge: false }
      >();
    if (links.error || !links.data) return null;
    if (!links.data.length) return clinics;
    const names = await client
      .from("template_save_requests")
      .select("id,original_filename")
      .in(
        "id",
        links.data.map((link) => link.template_id),
      );
    if (names.error || !names.data) return null;
    return data.map((row) => {
      const link = links.data.find((link) => link.clinic_id === row.id);
      const name = names.data.find(
        (name) => name.id === link?.template_id,
      )?.original_filename;
      return mapClinic(
        row,
        link ? { id: link.template_id, name: name! } : undefined,
      );
    });
  } catch {
    return null;
  }
}
