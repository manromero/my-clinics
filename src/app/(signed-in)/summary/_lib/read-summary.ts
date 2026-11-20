import "server-only";

import {
  monthlyDateRange,
  readMonthlyClinics,
  readMonthlyTotals,
} from "@/lib/monthly-scope/read-monthly-activity";
import type {
  MonthlyPeriod,
  MonthlyQuery,
} from "@/lib/monthly-scope/monthly-scope";
import { requireSupabaseSession } from "@/lib/supabase/session";
import { buildSummaryView, type SummaryViewData } from "./summary-view";

export async function readSummary(
  period: MonthlyPeriod,
  requestedClinic: MonthlyQuery["clinic"],
): Promise<SummaryViewData | null> {
  const { client } = await requireSupabaseSession();
  try {
    const [clinics, totals] = await Promise.all([
      readMonthlyClinics(client),
      readMonthlyTotals(client, monthlyDateRange(period)),
    ]);
    return buildSummaryView(period, requestedClinic, clinics, totals.clinics);
  } catch {
    return null;
  }
}
