import {
  monthKey,
  resolveMonthlyScope,
  type MonthlyPeriod,
  type MonthlyQuery,
} from "@/lib/monthly-scope/monthly-scope";
import type {
  SummaryAmounts,
  SummaryClinic,
  SummaryTotals,
  SummaryViewData,
} from "./summary-view";

const clinics: readonly SummaryClinic[] = [
  { id: "demo-gran-via", name: "Clínica Dental Gran Vía", active: true },
  { id: "demo-norte", name: "Centro Odontológico Norte", active: true },
  { id: "demo-alcorcon", name: "Clínica Dental Alcorcón", active: true },
  { id: "demo-san-jeronimo", name: "Dental San Jerónimo", active: false },
  { id: "demo-montecarmelo", name: "Clínica Montecarmelo", active: true },
];

type FixtureRow = SummaryAmounts & { clinicId: string };

const exampleRows: readonly FixtureRow[] = [
  {
    clinicId: "demo-gran-via",
    priceCents: BigInt(95000),
    grossCents: BigInt(28500),
    netCents: BigInt(24225),
  },
  {
    clinicId: "demo-gran-via",
    priceCents: BigInt(120000),
    grossCents: BigInt(35000),
    netCents: BigInt(29750),
  },
  {
    clinicId: "demo-norte",
    priceCents: BigInt(200000),
    grossCents: BigInt(50000),
    netCents: BigInt(42500),
  },
  {
    clinicId: "demo-norte",
    priceCents: BigInt(-15000),
    grossCents: BigInt(-2500),
    netCents: BigInt(-2125),
  },
  {
    clinicId: "demo-norte",
    priceCents: BigInt(0),
    grossCents: BigInt(0),
    netCents: BigInt(0),
  },
  {
    clinicId: "demo-alcorcon",
    priceCents: BigInt(73000),
    grossCents: BigInt(29150),
    netCents: BigInt(24777),
  },
  {
    clinicId: "demo-san-jeronimo",
    priceCents: BigInt(-12000),
    grossCents: BigInt(-2400),
    netCents: BigInt(-2040),
  },
];

// Keep deep links reproducible. Other months demonstrate a period without entries.
const rowsByMonth: Record<string, readonly FixtureRow[]> = {
  "2026-10": exampleRows.slice(0, 5),
  "2026-11": exampleRows,
};

const zeroTotals: SummaryTotals = {
  priceCents: BigInt(0),
  grossCents: BigInt(0),
  netCents: BigInt(0),
  rowCount: 0,
};

function sumTotals(left: SummaryTotals, right: SummaryTotals): SummaryTotals {
  return {
    priceCents: left.priceCents + right.priceCents,
    grossCents: left.grossCents + right.grossCents,
    netCents: left.netCents + right.netCents,
    rowCount: left.rowCount + right.rowCount,
  };
}

export function getSummaryFixtures(
  period: MonthlyPeriod,
  requestedClinic: MonthlyQuery["clinic"],
): SummaryViewData {
  const totalsByClinic = new Map<string, SummaryTotals>();
  for (const row of rowsByMonth[monthKey(period)] ?? []) {
    const previous = totalsByClinic.get(row.clinicId) ?? zeroTotals;
    totalsByClinic.set(
      row.clinicId,
      sumTotals(previous, { ...row, rowCount: 1 }),
    );
  }

  const includedClinics = clinics.filter(
    ({ active, id }) => active || totalsByClinic.has(id),
  );
  const clinicOptions = clinics.filter(
    (clinic) =>
      includedClinics.includes(clinic) || clinic.id === requestedClinic,
  );
  const scope = resolveMonthlyScope(period, requestedClinic, clinicOptions);
  const scopedClinics = includedClinics
    .filter(({ id }) => scope.clinicId === null || id === scope.clinicId)
    .map((clinic) => ({
      clinic,
      totals: totalsByClinic.get(clinic.id) ?? zeroTotals,
    }));

  return {
    scope,
    clinicOptions,
    clinics: scopedClinics,
    totals: scopedClinics
      .map(({ totals }) => totals)
      .reduce(sumTotals, zeroTotals),
  };
}
