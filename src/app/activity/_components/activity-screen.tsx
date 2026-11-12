import { Button } from "@/lib/components/button/button";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { Surface } from "@/lib/components/surface/surface";
import type { ActivityViewData } from "../_lib/activity-view";
import { ActivityFilters, activityMonthName } from "./activity-filters";

const euros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

function formatEuroCents(cents: `${bigint}`) {
  const sign = cents.startsWith("-") ? "-" : "";
  const digits = cents.replace(/^-/, "").padStart(3, "0");
  const amount =
    `${sign}${digits.slice(0, -2)}.${digits.slice(-2)}` as `${number}`;
  return euros.format(amount);
}

export function ActivityScreen({ data }: { data: ActivityViewData }) {
  const { scope, clinicOptions, totals, canCreate } = data;
  const clinic = clinicOptions.find(({ id }) => id === scope.clinicId);
  const cards = [
    { label: "Facturación total", value: formatEuroCents(totals.priceCents) },
    { label: "Ganancia bruta", value: formatEuroCents(totals.grossCents) },
    { label: "Registros", value: totals.rowCount },
    {
      label: "Ganancia tras IRPF",
      value: formatEuroCents(totals.netCents),
      highlighted: true,
    },
  ];

  return (
    <PageContainer as="main" className="flex-1 space-y-8">
      <div className="grid items-end gap-6 xl:grid-cols-[1fr_auto]">
        <PageHeader
          title="Actividad mensual"
          metadata={
            <p role="status">
              <span className="inline-block first-letter:uppercase">
                {activityMonthName(scope.month)} de {scope.year}
              </span>
              {" · "}
              {clinic ? clinic.name : "Todas las clínicas"}
              {clinic && !clinic.active && " (inactiva)"}
            </p>
          }
        />
        <ActivityFilters scope={scope} clinicOptions={clinicOptions} />
      </div>

      <section aria-labelledby="activity-totals">
        <h2 id="activity-totals" className="sr-only">
          Totales del periodo
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {cards.map(({ label, value, highlighted }) => (
            <Surface
              key={label}
              variant={highlighted ? "highlighted" : "white"}
              className="p-4 sm:p-6"
            >
              <dl className="space-y-2">
                <dt className="font-label text-caption font-semibold tracking-wide uppercase">
                  {label}
                </dt>
                <dd className="font-headline text-lg font-semibold tabular-nums sm:text-title">
                  {value}
                </dd>
              </dl>
            </Surface>
          ))}
        </div>
      </section>

      <div className="space-y-3">
        <Surface as="section" variant="tonal" aria-labelledby="activity-entry">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 id="activity-entry" className="font-headline text-title">
                Registrar actividad
              </h2>
              <p className="text-label text-on-surface-variant">
                {canCreate
                  ? "El formulario aún no está disponible en esta vista previa."
                  : "Necesitas una clínica activa para registrar actividad."}
              </p>
            </div>
            <Button disabled>Nueva actividad</Button>
          </div>
        </Surface>

        <Surface as="section" aria-labelledby="activity-list">
          <div className="space-y-2">
            <h2 id="activity-list" className="font-headline text-title">
              Registros de actividad
            </h2>
            <p className="text-label text-on-surface-variant">
              {totals.rowCount > 0
                ? "El detalle de los registros aún no está disponible en esta vista previa."
                : "No hay actividad para el periodo y la clínica seleccionados."}
            </p>
          </div>
        </Surface>
      </div>
    </PageContainer>
  );
}
