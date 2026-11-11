"use server";

import { revalidatePath } from "next/cache";
import { isClinicId } from "@/lib/clinics/clinic";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  clinicWriteError,
  validateClinicFields,
  type ClinicSaveResult,
} from "./clinic-write";

export async function updateClinic(
  id: string,
  formData: FormData,
): Promise<ClinicSaveResult> {
  const fields = validateClinicFields(formData);
  if (fields.status === "invalid") return fields;

  if (!isClinicId(id)) return { status: "missing" };
  const state = formData.get("active");
  if (state !== "active" && state !== "inactive") return { status: "failed" };

  const client = createSupabaseServerClient();
  if (!client) return { status: "failed" };

  try {
    const { data, error } = await client
      .from("clinics")
      .update({
        name: fields.name,
        percentage: fields.percentage,
        active: state === "active",
      })
      // Keep bigint IDs as strings on both sides of the PostgREST request.
      .filter("id", "eq", id)
      .select("id::text")
      .overrideTypes<{ id: string }[], { merge: false }>();

    if (error) return clinicWriteError(error);
    if (data?.length === 0) return { status: "missing" };
    if (data?.length !== 1 || data[0].id !== id) return { status: "failed" };
  } catch {
    return { status: "failed" };
  }

  revalidatePath("/clinics");
  return { status: "saved" };
}
