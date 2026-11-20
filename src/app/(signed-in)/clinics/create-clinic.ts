"use server";

import { revalidatePath } from "next/cache";
import { requireSupabaseActionSession } from "@/lib/supabase/session";
import { clinicWriteError, validateClinicFields } from "./clinic-write";

export async function createClinic(formData: FormData) {
  const { client, user } = await requireSupabaseActionSession();
  const fields = validateClinicFields(formData);
  if (fields.status === "invalid") return fields;

  try {
    const clinic = {
      name: fields.name,
      percentage: fields.percentage,
      owner_id: user.id,
    };
    const { error } = await client.from("clinics").insert(clinic);

    if (error) return clinicWriteError(error);
  } catch {
    return { status: "failed" } as const;
  }

  revalidatePath("/clinics");
  return { status: "saved" } as const;
}
