import "server-only";

import { isClinicId } from "@/lib/clinics/clinic";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseActionSession } from "@/lib/supabase/session";
import { activityAmountDecimal, isActivityDate } from "./activity-entry";
import type { EuroCents } from "./activity-view";

export type CreateActivityResult =
  | { status: "saved" }
  | { status: "invalid" | "clinic-unavailable" | "session-changed" | "failed" };

function isActivityCents(value: unknown): value is EuroCents {
  // The database allows up to 131053 integer digits and two decimal places.
  return typeof value === "string" && /^-?(0|[1-9]\d{0,131054})$/.test(value);
}

export async function createActivity(
  month: string,
  expectedOwnerId: string,
  draft: unknown,
): Promise<CreateActivityResult> {
  const { client, user } = await requireSupabaseActionSession();
  if (user.id !== expectedOwnerId) return { status: "session-changed" };
  if (!draft || typeof draft !== "object") return { status: "invalid" };

  const {
    date,
    clinicId,
    description,
    calculationMode,
    priceCents,
    directCents,
  } = draft as Record<string, unknown>;
  if (
    typeof date !== "string" ||
    !isActivityDate(date) ||
    !date.startsWith(`${month}-`) ||
    !isClinicId(clinicId) ||
    (description !== null && typeof description !== "string") ||
    !isActivityCents(priceCents) ||
    (calculationMode !== "percentage" && calculationMode !== "direct") ||
    (calculationMode === "percentage" && directCents !== null) ||
    (calculationMode === "direct" && !isActivityCents(directCents))
  ) {
    return { status: "invalid" };
  }

  try {
    // The generated RPC Args omit SQL parameter nullability. The RPC accepts
    // null for the optional description and percentage mode's direct amount.
    const args = {
      p_clinic_id: clinicId,
      p_activity_date: date,
      p_description: description?.trim() || null,
      p_price: activityAmountDecimal(priceCents),
      p_calculation_mode: calculationMode,
      p_direct_amount: isActivityCents(directCents)
        ? activityAmountDecimal(directCents)
        : null,
    } as Database["public"]["Functions"]["create_activity"]["Args"];
    const { data, error } = await client.rpc("create_activity", args);
    if (error?.code === "42501") return { status: "clinic-unavailable" };
    return { status: !error && isClinicId(data) ? "saved" : "failed" };
  } catch {
    return { status: "failed" };
  }
}
