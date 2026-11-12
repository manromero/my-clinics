import {
  activityPeriodFromQuery,
  activityPeriodParams,
  resolveActivityScope,
  type ActivityClinicOption,
  type ActivityQuery,
  type ActivityRow,
  type ActivityViewData,
} from "./activity-view";

const clinics: readonly ActivityClinicOption[] = [
  { id: "gran-via", name: "Gran Vía", active: true },
  { id: "dental-norte", name: "Dental Norte", active: true },
  { id: "san-jeronimo", name: "Dental San Jerónimo", active: false },
  { id: "clinica-centro", name: "Clínica Centro", active: false },
];

const activities: readonly ActivityRow[] = [
  {
    id: "revision-octubre",
    date: "2026-10-15",
    clinicId: "san-jeronimo",
    description: "Revisión periodontal",
    calculationMode: "percentage",
    appliedPercentageBasisPoints: 2500,
    appliedIrpfBasisPoints: 1500,
    priceCents: "11000",
    grossCents: "2750",
    netCents: "2338",
  },
  {
    id: "endodoncia-octubre",
    date: "2026-10-28",
    clinicId: "gran-via",
    description: "Endodoncia molar",
    calculationMode: "percentage",
    appliedPercentageBasisPoints: 3000,
    appliedIrpfBasisPoints: 1500,
    priceCents: "24000",
    grossCents: "7200",
    netCents: "6120",
  },
];

export function fixtureActivity(query: ActivityQuery): ActivityViewData {
  const period = activityPeriodFromQuery(query);
  const { year, month } = activityPeriodParams(period);
  const periodRows = activities.filter(({ date }) =>
    date.startsWith(`${year}-${month}-`),
  );
  const clinicIdsWithActivity = new Set(
    periodRows.map(({ clinicId }) => clinicId),
  );
  const clinicOptions = clinics.filter(
    ({ id, active }) => active || clinicIdsWithActivity.has(id),
  );
  const scope = resolveActivityScope(period, query.clinic, clinicOptions);
  const rows = periodRows.filter(
    ({ clinicId }) => scope.clinicId === null || scope.clinicId === clinicId,
  );
  const sum = (key: "priceCents" | "grossCents" | "netCents") =>
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
    canCreate: clinicOptions.some(({ active }) => active),
  };
}
