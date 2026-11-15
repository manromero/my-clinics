import "server-only";

import {
  monthlyDateRange,
  readMonthlyClinics,
  readMonthlyTotals,
} from "@/lib/monthly-scope/read-monthly-activity";
import { isClinicId } from "@/lib/clinics/clinic";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseSession } from "@/lib/supabase/session";
import { isActivityDate, parseActivityAmount } from "./activity-entry";
import {
  monthlyClinicOptions,
  resolveMonthlyScope,
  type MonthlyPeriod,
  type MonthlyQuery,
} from "@/lib/monthly-scope/monthly-scope";
import { type ActivityRow, type ActivityViewData } from "./activity-view";

type Client = Awaited<ReturnType<typeof requireSupabaseSession>>["client"];
type ActivityRecord = Pick<
  Database["public"]["Tables"]["activity"]["Row"],
  "activity_date" | "description" | "calculation_mode"
> & {
  activity_key: string;
  clinic_key: string;
  price: string;
  gross: string;
  net: string;
  applied_percentage: string;
  applied_irpf: string;
};
const activityPageSize = 50;

function cents(decimal: string) {
  // Rates may have trailing fractional zeros beyond their two meaningful digits.
  const amount = parseActivityAmount(decimal.replace(/(\.\d{2})0+$/, "$1"));
  if (amount === null) throw new Error("Invalid saved decimal");
  return amount;
}

function basisPoints(decimal: string) {
  const rate = Number(cents(decimal));
  if (rate < 0 || rate > 10000) throw new Error("Invalid saved rate");
  return rate;
}

function mapActivity(record: ActivityRecord): ActivityRow {
  const {
    activity_key: id,
    clinic_key: clinicId,
    activity_date: date,
    calculation_mode: calculationMode,
    description,
  } = record;
  if (
    !isClinicId(id) ||
    !isClinicId(clinicId) ||
    !isActivityDate(date) ||
    (calculationMode !== "percentage" && calculationMode !== "direct") ||
    (description !== null && typeof description !== "string")
  ) {
    throw new Error("Invalid saved activity");
  }
  return {
    id,
    clinicId,
    date,
    description,
    calculationMode,
    priceCents: cents(record.price),
    grossCents: cents(record.gross),
    netCents: cents(record.net),
    appliedPercentageBasisPoints: basisPoints(record.applied_percentage),
    appliedIrpfBasisPoints: basisPoints(record.applied_irpf),
  };
}

function clinicIdsWithActivity(
  groups: Awaited<ReturnType<typeof readMonthlyTotals>>["clinics"],
) {
  if (!Array.isArray(groups)) throw new Error("Invalid activity clinic totals");
  return new Set(
    groups.map((group) => {
      if (
        !group ||
        typeof group !== "object" ||
        Array.isArray(group) ||
        !isClinicId(group.clinic_id)
      ) {
        throw new Error("Invalid activity clinic totals");
      }
      return group.clinic_id;
    }),
  );
}

async function readRows(
  client: Client,
  range: ReturnType<typeof monthlyDateRange>,
  clinicId: string | null,
  first: number,
  size: number,
) {
  const rows: ActivityRow[] = [];
  // A Data API response limit may be lower than the visible page size.
  while (rows.length < size) {
    const query = client
      .from("activity")
      .select(
        "activity_key:id::text,clinic_key:clinic_id::text,activity_date,description,calculation_mode,price::text,gross::text,net::text,applied_percentage::text,applied_irpf::text",
      )
      .gte("activity_date", range.p_start)
      .lt("activity_date", range.p_end)
      .order("activity_date", { ascending: false })
      .order("id")
      .range(first + rows.length, first + size - 1);
    // Filter with the text ID so bigint values never pass through JS numbers.
    if (clinicId !== null) query.filter("clinic_id", "eq", clinicId);
    const { data, error } = await query.overrideTypes<
      ActivityRecord[],
      { merge: false }
    >();
    if (error || !data?.length || data.length > size - rows.length) {
      throw new Error("Could not read the full activity page");
    }
    for (const record of data) {
      const row = mapActivity(record);
      const previous = rows.at(-1);
      if (
        previous &&
        (row.date > previous.date ||
          (row.date === previous.date && BigInt(row.id) <= BigInt(previous.id)))
      ) {
        throw new Error("Activity rows changed during pagination");
      }
      rows.push(row);
    }
  }
  return rows;
}

async function readLastEnteredDate(
  client: Client,
  range: ReturnType<typeof monthlyDateRange>,
) {
  const { data, error } = await client
    .from("activity")
    .select("activity_date")
    .gte("activity_date", range.p_start)
    .lt("activity_date", range.p_end)
    .order("id", { ascending: false })
    .limit(1);
  if (error || !data) throw new Error("Could not read the last activity date");
  const date = data[0]?.activity_date;
  if (date !== undefined && !isActivityDate(date)) {
    throw new Error("Invalid last activity date");
  }
  return date;
}

export async function readActivity(
  period: MonthlyPeriod,
  requestedClinic: MonthlyQuery["clinic"],
  requestedPage: MonthlyQuery["page"],
): Promise<
  | (ActivityViewData & {
      page: number;
      pageCount: number;
      lastEntered?: ActivityRow["date"];
    })
  | null
> {
  const { client } = await requireSupabaseSession();
  try {
    const range = monthlyDateRange(period);
    const [accountClinics, monthlyTotals, lastEntered] = await Promise.all([
      readMonthlyClinics(client),
      readMonthlyTotals(client, range, null),
      readLastEnteredDate(client, range),
    ]);
    const historicalClinics = clinicIdsWithActivity(monthlyTotals.clinics);
    const clinicOptions = monthlyClinicOptions(
      accountClinics,
      historicalClinics,
      requestedClinic,
    ).map(({ percentage, ...clinic }) => ({
      ...clinic,
      percentageBasisPoints: basisPoints(percentage),
    }));
    const scope = resolveMonthlyScope(period, requestedClinic, clinicOptions);
    const savedTotals = scope.clinicId
      ? await readMonthlyTotals(client, range, scope.clinicId)
      : monthlyTotals;
    const rowCount = Number(savedTotals.row_count);
    if (
      !/^\d+$/.test(savedTotals.row_count) ||
      !Number.isSafeInteger(rowCount)
    ) {
      throw new Error("Invalid activity count");
    }
    const pageCount = Math.max(1, Math.ceil(rowCount / activityPageSize));
    const page =
      typeof requestedPage === "string" && /^[1-9]\d*$/.test(requestedPage)
        ? Math.min(Number(requestedPage), pageCount)
        : 1;
    const first = (page - 1) * activityPageSize;
    const rows = await readRows(
      client,
      range,
      scope.clinicId,
      first,
      Math.min(activityPageSize, rowCount - first),
    );
    return {
      scope,
      clinicOptions,
      rows,
      totals: {
        priceCents: cents(savedTotals.price),
        grossCents: cents(savedTotals.gross),
        netCents: cents(savedTotals.net),
        rowCount,
      },
      canCreate: accountClinics.some(({ active }) => active),
      page,
      pageCount,
      lastEntered,
    };
  } catch {
    return null;
  }
}
