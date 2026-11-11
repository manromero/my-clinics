"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { clinicWriteError, validateClinicFields } from "./clinic-write";

export async function createClinic(formData: FormData) {
  const fields = validateClinicFields(formData);
  if (fields.status === "invalid") return fields;

  const client = createSupabaseServerClient();
  if (!client) return { status: "failed" } as const;

  try {
    const { error } = await client
      .from("clinics")
      .insert({ name: fields.name, percentage: fields.percentage });

    if (error) return clinicWriteError(error);
  } catch {
    return { status: "failed" } as const;
  }

  revalidatePath("/clinics");
  return { status: "saved" } as const;
}
