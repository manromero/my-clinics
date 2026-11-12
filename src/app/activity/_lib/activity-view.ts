export type ActivityPeriod = { year: number; month: number };
export type ActivityScope = ActivityPeriod & { clinicId: string | null };
export type ActivityQuery = Record<string, string | string[] | undefined>;
export type ActivityPreview = "inactive" | "loading" | "error" | "write-error";

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
  scope: ActivityScope;
  // The account's active clinics and its inactive clinics with activity in the period.
  clinicOptions: readonly ActivityClinicOption[];
  rows: readonly ActivityRow[];
  totals: ActivityTotals;
  // Creation is available when the account has an active clinic, regardless of the filter.
  canCreate: boolean;
};

const madridCalendar = new Intl.DateTimeFormat("es-ES", {
  timeZone: "Europe/Madrid",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  timeZone: "UTC",
});

export function activityMonthName(month: number) {
  return monthFormatter.format(new Date(Date.UTC(2000, month - 1, 1)));
}

// `year` and `month` are a pair. Missing, duplicate or invalid values use the Madrid month.
export function activityPeriodFromQuery(
  { year, month }: ActivityQuery,
  now = new Date(),
): ActivityPeriod {
  if (
    typeof year === "string" &&
    /^[0-9]{4}$/.test(year) &&
    year !== "0000" &&
    typeof month === "string" &&
    /^(0?[1-9]|1[0-2])$/.test(month)
  ) {
    return { year: Number(year), month: Number(month) };
  }

  const { year: madridYear, month: madridMonth } = madridDateParts(now);
  return { year: madridYear, month: madridMonth };
}

export function madridDateParts(now = new Date()) {
  const parts = madridCalendar.formatToParts(now);
  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

export function activityMonthKey(period: ActivityPeriod) {
  const { year, month } = activityPeriodParams(period);
  return `${year}-${month}`;
}

export function activityView(
  period: ActivityPeriod,
  requestedClinic: ActivityQuery["clinic"],
  accountClinics: readonly ActivityClinicOption[],
  activities: readonly ActivityRow[],
): ActivityViewData {
  const month = activityMonthKey(period);
  const periodRows = activities.filter(({ date }) =>
    date.startsWith(`${month}-`),
  );
  const clinicIdsWithActivity = new Set(
    periodRows.map(({ clinicId }) => clinicId),
  );
  const clinicOptions = accountClinics.filter(
    ({ id, active }) => active || clinicIdsWithActivity.has(id),
  );
  const scope = resolveActivityScope(period, requestedClinic, clinicOptions);
  const rows = periodRows
    .filter(
      ({ clinicId }) => scope.clinicId === null || scope.clinicId === clinicId,
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  const sum = (key: keyof ActivityAmounts) =>
    `${rows.reduce((total, row) => total + BigInt(row[key]), BigInt(0))}` as const;

  return {
    scope,
    clinicOptions,
    rows,
    totals: {
      priceCents: sum("priceCents"),
      grossCents: sum("grossCents"),
      netCents: sum("netCents"),
      rowCount: rows.length,
    },
    canCreate: accountClinics.some(({ active }) => active),
  };
}

export function resolveActivityScope(
  period: ActivityPeriod,
  clinic: ActivityQuery["clinic"],
  clinicOptions: readonly ActivityClinicOption[],
): ActivityScope {
  const clinicId =
    typeof clinic === "string" &&
    clinic !== "" &&
    clinicOptions.some(({ id }) => id === clinic)
      ? clinic
      : null;
  return { ...period, clinicId };
}

export function activityPeriodParams({ year, month }: ActivityPeriod) {
  return {
    year: String(year).padStart(4, "0"),
    month: String(month).padStart(2, "0"),
  };
}

export function activityScopeParams(
  scope: ActivityScope,
  preview?: ActivityPreview,
) {
  const params = new URLSearchParams(activityPeriodParams(scope));
  if (scope.clinicId !== null) params.set("clinic", scope.clinicId);
  if (preview) params.set("preview", preview);
  return params.toString();
}

export function adjacentActivityPeriod(
  { year, month }: ActivityPeriod,
  direction: -1 | 1,
): ActivityPeriod | null {
  const index = year * 12 + month - 1 + direction;
  const adjacentYear = Math.floor(index / 12);
  if (adjacentYear < 1 || adjacentYear > 9999) return null;
  return { year: adjacentYear, month: (index % 12) + 1 };
}
