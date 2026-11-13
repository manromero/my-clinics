import type { ReactNode, Ref } from "react";
import { EmptyState } from "@/lib/components/empty-state/empty-state";
import { Surface } from "@/lib/components/surface/surface";
import { activityCount, formatEuroCents } from "../_lib/activity-format";
import type { ActivityViewData } from "../_lib/activity-view";
import { ActivityList, type ActivityRowAction } from "./activity-list";

export function ActivityResults({
  data: { scope, clinicOptions, rows, totals },
  listHeading,
  toolbar,
  notice,
  pagination,
  onAction,
}: {
  data: ActivityViewData;
  listHeading?: Ref<HTMLHeadingElement>;
  toolbar?: ReactNode;
  notice?: ReactNode;
  pagination?: ReactNode;
  onAction?: ActivityRowAction;
}) {
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

      <Surface
        as="section"
        aria-labelledby="activity-list"
        className="sm:p-6 xl:p-0"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 xl:px-6 xl:pt-6">
          <h2
            id="activity-list"
            ref={listHeading}
            tabIndex={-1}
            className="font-headline text-title"
          >
            Registros de actividad
          </h2>
          {toolbar}
        </div>
        {notice}
        {rows.length > 0 ? (
          <ActivityList
            rows={rows}
            clinicOptions={clinicOptions}
            onAction={onAction}
          />
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
        {pagination}
      </Surface>
    </>
  );
}
