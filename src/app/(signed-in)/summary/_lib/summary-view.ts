import { isClinicId } from "@/lib/clinics/clinic";
import { formatEuroCents, recordCount } from "@/lib/format/amounts";
import {
  monthlyClinicOptions,
  resolveMonthlyScope,
  type MonthlyPeriod,
  type MonthlyQuery,
  type MonthlyScope,
} from "@/lib/monthly-scope/monthly-scope";
import type { Json } from "@/lib/supabase/database.types";

export type SummaryClinic = { id: string; name: string; active: boolean };

export type SummaryAmounts = {
  priceCents: bigint;
  grossCents: bigint;
  netCents: bigint;
};

export type SummaryTotals = SummaryAmounts & { rowCount: number };

export type SummaryViewData = {
  scope: MonthlyScope;
  clinicOptions: readonly SummaryClinic[];
  clinics: readonly { clinic: SummaryClinic; totals: SummaryTotals }[];
  totals: SummaryTotals;
};

const zeroTotals: SummaryTotals = {
  priceCents: BigInt(0),
  grossCents: BigInt(0),
  netCents: BigInt(0),
  rowCount: 0,
};

function savedCents(decimal: Json | undefined) {
  if (typeof decimal !== "string" || !/^-?\d+(?:\.\d{1,2}0*)?$/.test(decimal)) {
    throw new Error("Invalid saved summary amount");
  }
  const [integer, fraction = ""] = decimal.split(".");
  return BigInt(integer + fraction.slice(0, 2).padEnd(2, "0"));
}

export function buildSummaryView(
  period: MonthlyPeriod,
  requestedClinic: MonthlyQuery["clinic"],
  accountClinics: readonly SummaryClinic[],
  groups: Json,
): SummaryViewData {
  if (!Array.isArray(groups)) throw new Error("Invalid saved summary groups");

  const clinicIds = new Set(accountClinics.map(({ id }) => id));
  const totalsByClinic = new Map<string, SummaryTotals>();
  for (const group of groups) {
    if (!group || typeof group !== "object" || Array.isArray(group)) {
      throw new Error("Invalid saved summary group");
    }
    const { clinic_id: id, row_count: count, price, gross, net } = group;
    const rowCount = Number(count);
    if (
      !isClinicId(id) ||
      !clinicIds.has(id) ||
      totalsByClinic.has(id) ||
      typeof count !== "string" ||
      !/^[1-9]\d*$/.test(count) ||
      !Number.isSafeInteger(rowCount)
    ) {
      throw new Error("Invalid saved summary group");
    }
    totalsByClinic.set(id, {
      priceCents: savedCents(price),
      grossCents: savedCents(gross),
      netCents: savedCents(net),
      rowCount,
    });
  }

  const clinicOptions = monthlyClinicOptions(
    accountClinics,
    new Set(totalsByClinic.keys()),
    requestedClinic,
  );
  const scope = resolveMonthlyScope(period, requestedClinic, clinicOptions);
  const clinics = clinicOptions.flatMap((clinic) => {
    if (scope.clinicId !== null && clinic.id !== scope.clinicId) return [];

    const totals = totalsByClinic.get(clinic.id);
    return totals ? [{ clinic, totals }] : [];
  });
  const totals = clinics.reduce(
    (sum, { totals }) => ({
      priceCents: sum.priceCents + totals.priceCents,
      grossCents: sum.grossCents + totals.grossCents,
      netCents: sum.netCents + totals.netCents,
      rowCount: sum.rowCount + totals.rowCount,
    }),
    zeroTotals,
  );
  if (!Number.isSafeInteger(totals.rowCount)) {
    throw new Error("Invalid saved summary count");
  }
  return { scope, clinicOptions, clinics, totals };
}

export function summaryMeasures(totals: SummaryTotals) {
  const adjustments = totals.netCents - totals.grossCents;
  return [
    { label: "Importe total", amount: totals.priceCents },
    { label: "Ganancia bruta", amount: totals.grossCents },
    { label: "Ajuste IRPF", amount: adjustments },
    { label: "Ganancia tras IRPF", amount: totals.netCents, highlighted: true },
  ]
    .map(({ label, amount, highlighted }) => ({
      label,
      value: formatEuroCents(`${amount}`),
      negative: amount < BigInt(0),
      highlighted: highlighted ?? false,
    }))
    .concat({
      label: "Registros",
      value: recordCount.format(totals.rowCount),
      negative: false,
      highlighted: false,
    });
}
