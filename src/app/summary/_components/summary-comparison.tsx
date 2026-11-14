import { Surface } from "@/lib/components/surface/surface";
import { formatEuroCents } from "@/lib/format/amounts";
import {
  monthName,
  monthlyPeriodParams,
} from "@/lib/monthly-scope/monthly-scope";
import type { SummaryViewData } from "../_lib/summary-view";

const zero = BigInt(0);

function magnitude(amount: bigint) {
  return amount < zero ? -amount : amount;
}

export function SummaryComparison({
  clinics,
  scope,
  totals,
}: Pick<SummaryViewData, "clinics" | "scope" | "totals">) {
  const scale = clinics.reduce(
    (sum, { totals }) => sum + magnitude(totals.priceCents),
    zero,
  );

  return (
    <Surface
      as="section"
      aria-labelledby="summary-comparison"
      className="sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div>
          <h2
            id="summary-comparison"
            className="font-headline text-lg font-semibold"
          >
            Importes y ganancias por clínica
          </h2>
          <p className="font-label text-caption text-on-surface-variant">
            <span className="inline-block first-letter:uppercase">
              {monthName(scope.month)} de {monthlyPeriodParams(scope).year}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-label text-caption text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full bg-primary"
            />
            Importe positivo
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full bg-error"
            />
            Importe negativo
          </span>
        </div>
      </div>
      <ul className="mt-7 space-y-4">
        {clinics.map(({ clinic, totals }) => {
          const price = magnitude(totals.priceCents);
          const negativePrice = totals.priceCents < zero;
          const width =
            scale === zero ? 0 : Number((price * BigInt(10_000)) / scale) / 100;

          return (
            <li key={clinic.id} className="space-y-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 font-label text-caption">
                <p className="font-medium">
                  {clinic.name}
                  {!clinic.active && (
                    <span className="ml-1.5 font-normal text-on-surface-variant">
                      (Inactiva)
                    </span>
                  )}
                </p>
                <dl className="flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
                  <div>
                    <dt className="sr-only">Importe total</dt>
                    <dd
                      className={
                        negativePrice
                          ? "font-semibold text-error"
                          : "text-on-surface-variant"
                      }
                    >
                      {formatEuroCents(`${totals.priceCents}`)}
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Ganancia tras IRPF</dt>
                    <dd
                      className={`font-semibold ${totals.netCents < zero ? "text-error" : "text-primary"}`}
                    >
                      <span aria-hidden="true">→ </span>
                      {formatEuroCents(`${totals.netCents}`)}
                      <span aria-hidden="true"> neto</span>
                    </dd>
                  </div>
                </dl>
              </div>
              <div
                aria-hidden="true"
                className="h-3 overflow-hidden rounded-full bg-surface-container"
              >
                {width > 0 && (
                  <div
                    className={`h-full rounded-full ${negativePrice ? "bg-error" : "bg-primary"}`}
                    style={{ width: `${width}%` }}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg bg-surface-container-low px-4 py-3 font-label text-caption">
        <p className="text-on-surface-variant">
          Cada barra representa la proporción del importe de la clínica sobre la
          suma de los importes sin signo.
        </p>
        <p className="font-semibold text-primary tabular-nums">
          Importe total con signo: {formatEuroCents(`${totals.priceCents}`)}
        </p>
      </div>
    </Surface>
  );
}
