import { EmptyState } from "@/lib/components/empty-state/empty-state";
import { Surface } from "@/lib/components/surface/surface";
import { summaryMeasures, type SummaryViewData } from "../_lib/summary-view";
import { SummaryBreakdown } from "./summary-breakdown";
import { SummaryComparison } from "./summary-comparison";

export function SummaryResults({ data }: { data: SummaryViewData }) {
  const { clinics, totals } = data;

  return (
    <>
      <section aria-labelledby="summary-totals">
        <h2 id="summary-totals" className="sr-only">
          Totales del periodo
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5 [&>*:last-child]:max-lg:col-span-2">
          {summaryMeasures(totals).map(
            ({ label, value, negative, highlighted }) => (
              <Surface
                key={label}
                variant={highlighted ? "highlighted" : "white"}
                className="p-4 sm:p-5"
              >
                <dl className="space-y-2">
                  <dt
                    className={`font-label text-caption font-semibold tracking-wide uppercase ${highlighted ? "text-on-primary" : "text-on-surface-variant"}`}
                  >
                    {label}
                  </dt>
                  <dd
                    className={`font-headline text-lg font-semibold tabular-nums sm:text-title ${negative && !highlighted ? "text-error" : ""}`}
                  >
                    {value}
                  </dd>
                </dl>
              </Surface>
            ),
          )}
        </div>
      </section>
      {clinics.length > 0 ? (
        <SummaryComparison clinics={clinics} />
      ) : (
        <EmptyState
          title="No hay clínicas en este resumen"
          explanation="Selecciona otra clínica o cambia el periodo."
        />
      )}
      <SummaryBreakdown clinics={clinics} totals={totals} />
    </>
  );
}
