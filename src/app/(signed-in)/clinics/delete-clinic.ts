"use server";

import { revalidatePath } from "next/cache";
import { isClinicId } from "@/lib/clinics/clinic";
import { requireSupabaseActionSession } from "@/lib/supabase/session";
import { createTemplateServer } from "@/lib/templates/server";

export type ClinicDeleteResult =
  "deleted" | "linked-activity" | "session-changed" | "missing" | "failed";

export async function deleteClinic(
  id: string,
  expectedOwnerId: string,
  templateId?: string,
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

  // The form-observed UUID is only a cleanup candidate. The existing server
  // guard rejects foreign, current and publishable files. A concurrent unseen
  // replacement can remain private under the established retention policy.
  if (templateId) {
    try {
      await createTemplateServer(client)?.cleanupAffected(templateId);
    } catch {
      // Deletion already committed; a cleanup outage must not report failure.
    }
  }

  revalidatePath("/clinics");
  revalidatePath("/summary");
  revalidatePath("/activity");
  revalidatePath("/invoices");
  return "deleted";
}
