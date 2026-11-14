"use server";

import { revalidatePath } from "next/cache";
import { isClinicId } from "@/lib/clinics/clinic";
import { requireSupabaseActionSession } from "@/lib/supabase/session";

export type ClinicDeleteResult =
  "deleted" | "linked-activity" | "session-changed" | "missing" | "failed";

export async function deleteClinic(
  id: string,
  expectedOwnerId: string,
): Promise<ClinicDeleteResult> {
  const { client, user } = await requireSupabaseActionSession();
  if (user.id !== expectedOwnerId) return "session-changed";
  if (!isClinicId(id)) return "failed";

  try {
    const { data, error } = await client.rpc("delete_clinic", { p_id: id });
    if (error?.code === "42501" && error.message === "Clinic is unavailable") {
      return "missing";
    }
    if (
      error?.code === "23503" &&
      error.message === "Clinic has saved activity"
    ) {
      return "linked-activity";
    }
    if (error || data !== id) return "failed";
  } catch {
    return "failed";
  }

  revalidatePath("/clinics");
  revalidatePath("/activity");
  return "deleted";
}
