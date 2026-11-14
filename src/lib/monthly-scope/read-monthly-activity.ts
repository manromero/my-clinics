import "server-only";

import { isClinicId } from "@/lib/clinics/clinic";
import type { requireSupabaseSession } from "@/lib/supabase/session";
import { monthKey, type MonthlyPeriod } from "./monthly-scope";

type Client = Awaited<ReturnType<typeof requireSupabaseSession>>["client"];
type ClinicRecord = {
  clinic_key: string;
  name: string;
  percentage: string;
  active: boolean;
};

type MonthlyClinic = {
  id: string;
  name: string;
  percentage: string;
  active: boolean;
};

export function monthlyDateRange(period: MonthlyPeriod) {
  const next =
    period.month === 12
      ? { year: period.year + 1, month: 1 }
      : { year: period.year, month: period.month + 1 };
  return {
    p_start: `${monthKey(period)}-01`,
    p_end: `${monthKey(next)}-01`,
  };
}

export async function readMonthlyClinics(client: Client) {
  const clinics: MonthlyClinic[] = [];
  for (;;) {
    const query = client
      .from("clinics")
      .select("clinic_key:id::text,name,percentage::text,active")
      .order("id")
      .limit(100);
    const last = clinics.at(-1);
    if (last) query.gt("id", last.id);
    const { data, error } = await query.overrideTypes<
      ClinicRecord[],
      { merge: false }
    >();
    if (error || !data) throw new Error("Could not read monthly clinics");
    if (data.length === 0) return clinics;

    for (const { clinic_key: id, name, percentage, active } of data) {
      const previous = clinics.at(-1);
      if (
        !isClinicId(id) ||
        (previous && BigInt(id) <= BigInt(previous.id)) ||
        typeof name !== "string" ||
        !name.trim() ||
        typeof active !== "boolean"
      ) {
        throw new Error("Invalid monthly clinic");
      }
      clinics.push({
        id,
        name,
        active,
        percentage,
      });
    }
  }
}

export async function readMonthlyTotals(
  client: Client,
  range: ReturnType<typeof monthlyDateRange>,
  clinicId: string | null = null,
) {
  const { data, error } = await client
    .rpc("activity_period_totals", {
      ...range,
      ...(clinicId === null ? {} : { p_clinic_id: clinicId }),
    })
    .single();
  if (error || !data) throw new Error("Could not read monthly totals");
  return data;
}
