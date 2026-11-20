import { Surface } from "@/lib/components/surface/surface";
import { formatEuroCents } from "@/lib/format/amounts";
import {
  monthName,
  monthlyPeriodParams,
} from "@/lib/monthly-scope/monthly-scope";
import type { SummaryViewData } from "../_lib/summary-view";

const zero = BigInt(0);

function barWidth(netCents: bigint, totalNetCents: bigint) {
  if (netCents <= zero || totalNetCents <= zero) return 0;
  if (netCents >= totalNetCents) return 100;

  // Scale before converting to a number so large saved amounts stay finite.
  return Number((netCents * BigInt(1_000_000)) / totalNetCents) / 10_000;
}

export function SummaryComparison({
  clinics,
  scope,
  totals: { netCents: totalNetCents },
}: Pick<SummaryViewData, "clinics" | "scope" | "totals">) {
  return (
    <Surface
      as="section"
      aria-labelledby="summary-comparison"
      className="sm:p-6"
    >
      <h2
        id="summary-comparison"
        className="font-headline text-lg font-semibold"
      >
        Ganancias tras IRPF por clínica
      </h2>
      <p className="font-label text-caption text-on-surface-variant">
        <span className="inline-block first-letter:uppercase">
          {monthName(scope.month)} de {monthlyPeriodParams(scope).year}
        </span>
      </p>
      <ul className="mt-7 space-y-4">
        {clinics.map(({ clinic, totals: { netCents } }) => {
          const width = barWidth(netCents, totalNetCents);

          return (
            <li key={clinic.id} className="space-y-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 font-label text-label">
                <p className="font-medium [overflow-wrap:anywhere]">
                  {clinic.name}
                  {!clinic.active && (
                    <span className="ml-1.5 font-normal text-on-surface-variant">
                      (Inactiva)
                    </span>
                  )}
                </p>
                <p
                  className={`ml-auto text-right font-semibold tabular-nums [overflow-wrap:anywhere] ${netCents < zero ? "text-error" : "text-primary"}`}
                >
                  {formatEuroCents(`${netCents}`)}
                </p>
              </div>
              <div
                aria-hidden="true"
                className="h-3 overflow-hidden rounded-full bg-surface-container"
              >
                {width > 0 && (
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${width}%` }}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 rounded-lg bg-surface-container-low px-4 py-3 font-label text-caption text-on-surface-variant">
        Cada barra muestra la ganancia de la clínica como porcentaje del total
        que figura en “Ganancia tras IRPF”. Las pérdidas se muestran en rojo,
        con la barra vacía.
      </p>
    </Surface>
  );
}
