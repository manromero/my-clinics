import {
  madridDateParts,
  monthlyScopeParams,
  type MonthlyScope,
} from "@/lib/monthly-scope/monthly-scope";

export type ActivityClinicOption = {
  id: string;
  name: string;
  active: boolean;
  percentageBasisPoints: number;
};

export type EuroCents = `${bigint}`;

type ActivityAmounts = {
  priceCents: EuroCents;
  grossCents: EuroCents;
  netCents: EuroCents;
};

export type ActivityRow = ActivityAmounts & {
  id: string;
  date: `${number}-${number}-${number}`;
  clinicId: string;
  description: string | null;
  calculationMode: "percentage" | "direct";
  appliedPercentageBasisPoints: number;
  appliedIrpfBasisPoints: number;
};

export type ActivityTotals = ActivityAmounts & { rowCount: number };

export type ActivityViewData = {
  scope: MonthlyScope;
  // Active clinics, inactive clinics with activity, and the selected owned clinic.
  clinicOptions: readonly ActivityClinicOption[];
  rows: readonly ActivityRow[];
  totals: ActivityTotals;
  // Creation is available when the account has an active clinic, regardless of the filter.
  canCreate: boolean;
};

export function currentActivityHref(now = new Date()) {
  const period = madridDateParts(now);
  return `/activity?${monthlyScopeParams({ ...period, clinicId: null })}`;
}
