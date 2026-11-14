import { formatEuroCents, recordCount } from "@/lib/format/amounts";
import type { MonthlyScope } from "@/lib/monthly-scope/monthly-scope";

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
