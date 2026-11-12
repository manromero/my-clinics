import { Suspense } from "react";
import { ActionLink } from "@/lib/components/action-link/action-link";
import { Alert } from "@/lib/components/alert/alert";
import { Button } from "@/lib/components/button/button";
import { EmptyState } from "@/lib/components/empty-state/empty-state";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { Surface } from "@/lib/components/surface/surface";
import {
  activityMonthName,
  activityScopeParams,
  type ActivityPreview,
  type ActivityViewData,
} from "../_lib/activity-view";
import { activityCount, formatEuroCents } from "../_lib/activity-format";
import { ActivityFilters } from "./activity-filters";
import { ActivityList } from "./activity-list";

async function ActivityPreviewResults({
  data,
  preview,
}: {
  data: ActivityViewData;
  preview?: ActivityPreview;
}) {
  const { scope, clinicOptions, rows, totals, canCreate } = data;
  if (preview === "loading") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  if (preview === "error") {
    return (
      <Alert
        title="No se pudo cargar la actividad"
        variant="error"
        announcement="assertive"
      >
        <p>Vuelve a intentarlo para consultar los registros del periodo.</p>
        <ActionLink href={`/activity?${activityScopeParams(scope)}`}>
          Reintentar
        </ActionLink>
      </Alert>
    );
  }
  const cards = [
    { label: "Facturación total", value: formatEuroCents(totals.priceCents) },
    { label: "Ganancia bruta", value: formatEuroCents(totals.grossCents) },
    { label: "Registros", value: activityCount.format(totals.rowCount) },
    {
      label: "Ganancia tras IRPF",
      value: formatEuroCents(totals.netCents),
      highlighted: true,
    },
  ];

  return (
    <>
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

      {!canCreate && (
        <Alert title="No hay clínicas activas" variant="warning">
          <p>
            Crea una clínica o reactiva una existente para registrar actividad.
          </p>
          <ActionLink href="/clinics">Ir a Clínicas</ActionLink>
        </Alert>
      )}
      <Surface
        as="section"
        aria-labelledby="activity-list"
        className="sm:p-6 xl:p-0"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 xl:px-6 xl:pt-6">
          <h2 id="activity-list" className="font-headline text-title">
            Registros de actividad
          </h2>
          <Button disabled>Nueva actividad</Button>
        </div>
        {rows.length > 0 ? (
          <ActivityList rows={rows} clinicOptions={clinicOptions} />
        ) : (
          <EmptyState
            className="xl:mx-6 xl:mb-6"
            headingLevel={3}
            title={
              scope.clinicId
                ? "No hay registros para esta clínica"
                : "No hay registros este mes"
            }
            explanation={
              scope.clinicId
                ? "Selecciona otra clínica o cambia el periodo."
                : "Selecciona otro periodo para consultar el historial."
            }
          />
        )}
      </Surface>
    </>
  );
}

export function ActivityScreen({
  data,
  preview,
}: {
  data: ActivityViewData;
  preview?: ActivityPreview;
}) {
  const { scope, clinicOptions } = data;
  const clinic = clinicOptions.find(({ id }) => id === scope.clinicId);
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
        <ActivityFilters
          scope={scope}
          clinicOptions={clinicOptions}
          preview={preview}
        />
      </div>
      <Suspense
        key={activityScopeParams(scope, preview)}
        fallback={
          <LoadingState
            label="Cargando actividad…"
            variant="region"
            indicator="skeleton"
          />
        }
      >
        <ActivityPreviewResults data={data} preview={preview} />
      </Suspense>
    </PageContainer>
  );
}
