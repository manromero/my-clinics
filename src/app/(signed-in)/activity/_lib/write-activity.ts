import "server-only";

import { isClinicId } from "@/lib/clinics/clinic";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseActionSession } from "@/lib/supabase/session";
import { activityAmountDecimal, isActivityDate } from "./activity-entry";
import type { EuroCents } from "./activity-view";

export type ActivityWriteResult =
  | "saved"
  | "invalid"
  | "clinic-unavailable"
  | "activity-unavailable"
  | "edit-unavailable"
  | "session-changed"
  | "failed";

type SaveTarget = { month: string } | { id: string };

function isActivityCents(value: unknown): value is EuroCents {
  // The database allows up to 131053 integer digits and two decimal places.
  return typeof value === "string" && /^-?(0|[1-9]\d{0,131054})$/.test(value);
}

export async function saveActivity(
  target: SaveTarget,
  expectedOwnerId: string,
  draft: unknown,
): Promise<ActivityWriteResult> {
  const { client, user } = await requireSupabaseActionSession();
  if (user.id !== expectedOwnerId) return "session-changed";
  if (!draft || typeof draft !== "object") return "invalid";

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
    ("month" in target && !date.startsWith(`${target.month}-`)) ||
    ("id" in target && !isClinicId(target.id)) ||
    !isClinicId(clinicId) ||
    (description !== null && typeof description !== "string") ||
    !isActivityCents(priceCents) ||
    (calculationMode !== "percentage" && calculationMode !== "direct") ||
    (calculationMode === "percentage" && directCents !== null) ||
    (calculationMode === "direct" && !isActivityCents(directCents))
  ) {
    return "invalid";
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
    if ("id" in target) {
      const { data, error } = await client.rpc("update_activity", {
        ...args,
        p_id: target.id,
      });
      if (error?.code === "42501") return "edit-unavailable";
      return !error && data === target.id ? "saved" : "failed";
    }

    const { data, error } = await client.rpc("create_activity", args);
    if (error?.code === "42501") return "clinic-unavailable";
    return !error && isClinicId(data) ? "saved" : "failed";
  } catch {
    return "failed";
  }
}

export async function deleteActivity(
  id: string,
  expectedOwnerId: string,
): Promise<ActivityWriteResult> {
  const { client, user } = await requireSupabaseActionSession();
  if (user.id !== expectedOwnerId) return "session-changed";
  if (!isClinicId(id)) return "invalid";

  try {
    const { data, error } = await client.rpc("delete_activity", { p_id: id });
    if (error?.code === "42501") return "activity-unavailable";
    return !error && data === id ? "saved" : "failed";
  } catch {
    return "failed";
  }
}
