export type MonthlyPeriod = { year: number; month: number };
export type MonthlyScope = MonthlyPeriod & { clinicId: string | null };
export type MonthlyQuery = Record<string, string | string[] | undefined>;

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

export function monthName(month: number) {
  return monthFormatter.format(new Date(Date.UTC(2000, month - 1, 1)));
}

// `year` and `month` are a pair. Missing, duplicate or invalid values use the Madrid month.
export function monthlyPeriodFromQuery(
  { year, month }: MonthlyQuery,
  now = new Date(),
): MonthlyPeriod {
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

export function monthKey(period: MonthlyPeriod) {
  const { year, month } = monthlyPeriodParams(period);
  return `${year}-${month}`;
}

export function resolveMonthlyScope(
  period: MonthlyPeriod,
  clinic: MonthlyQuery["clinic"],
  clinicOptions: readonly { id: string }[],
): MonthlyScope {
  const clinicId =
    typeof clinic === "string" &&
    clinic !== "" &&
    clinicOptions.some(({ id }) => id === clinic)
      ? clinic
      : null;
  return { ...period, clinicId };
}

export function monthlyPeriodParams({ year, month }: MonthlyPeriod) {
  return {
    year: String(year).padStart(4, "0"),
    month: String(month).padStart(2, "0"),
  };
}

export function monthlyScopeParams(scope: MonthlyScope) {
  const params = new URLSearchParams(monthlyPeriodParams(scope));
  if (scope.clinicId !== null) params.set("clinic", scope.clinicId);
  return params.toString();
}

export function adjacentMonthlyPeriod(
  { year, month }: MonthlyPeriod,
  direction: -1 | 1,
): MonthlyPeriod | null {
  const index = year * 12 + month - 1 + direction;
  const adjacentYear = Math.floor(index / 12);
  if (adjacentYear < 1 || adjacentYear > 9999) return null;
  return { year: adjacentYear, month: (index % 12) + 1 };
}
