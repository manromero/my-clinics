import Form from "next/form";
import { ActionLink } from "@/lib/components/action-link/action-link";
import { Button } from "@/lib/components/button/button";
import { FieldLabel } from "@/lib/components/field-label/field-label";
import { Select } from "@/lib/components/select/select";
import {
  activityPeriodParams,
  activityScopeParams,
  adjacentActivityPeriod,
  type ActivityScope,
  type ActivityViewData,
} from "../_lib/activity-view";

const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  timeZone: "UTC",
});

export function activityMonthName(month: number) {
  return monthFormatter.format(new Date(Date.UTC(2000, month - 1, 1)));
}

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  label: activityMonthName(index + 1),
  value: String(index + 1).padStart(2, "0"),
}));

function AdjacentMonth({
  scope,
  direction,
}: {
  scope: ActivityScope;
  direction: -1 | 1;
}) {
  const period = adjacentActivityPeriod(scope, direction);
  if (period === null) return null;

  return (
    <ActionLink
      href={`/activity?${activityScopeParams({ ...period, clinicId: scope.clinicId })}`}
      scroll={false}
      className="mb-px size-11 shrink-0 bg-surface-container-low hover:bg-surface-container-high"
    >
      <span className="sr-only">
        {direction === -1 ? "Mes anterior" : "Mes siguiente"}
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={direction === -1 ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
      </svg>
    </ActionLink>
  );
}

export function ActivityFilters({
  scope,
  clinicOptions,
}: Pick<ActivityViewData, "scope" | "clinicOptions">) {
  const { year, month } = activityPeriodParams(scope);

  return (
    <Form
      key={activityScopeParams(scope)}
      action="/activity"
      aria-label="Filtros de actividad"
      scroll={false}
      className="flex flex-wrap items-end gap-x-4 gap-y-3"
    >
      <div className="flex w-full min-w-0 items-end gap-2 sm:w-auto">
        <AdjacentMonth scope={scope} direction={-1} />
        <div className="min-w-0 flex-1 sm:w-34">
          <Select
            name="month"
            label="Mes"
            className="capitalize"
            defaultValue={month}
            options={monthOptions}
            showRequirement={false}
          />
        </div>
        <div className="w-16 shrink-0 space-y-2">
          <FieldLabel htmlFor="activity-year" className="block">
            Año
          </FieldLabel>
          <input
            id="activity-year"
            name="year"
            type="text"
            inputMode="numeric"
            defaultValue={year}
            maxLength={4}
            pattern="(?!0000)[0-9]{4}"
            title="Introduce un año de cuatro cifras."
            required
            className="min-h-11 w-full rounded-lg border border-outline-variant/15 bg-surface-container-lowest px-2.5 py-2 tabular-nums focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          />
        </div>
        <AdjacentMonth scope={scope} direction={1} />
      </div>
      <div className="flex min-w-0 flex-1 items-end gap-2 sm:flex-initial">
        <div className="min-w-0 flex-1 sm:w-44">
          <Select
            name="clinic"
            label="Clínica"
            defaultValue={scope.clinicId ?? ""}
            options={[
              { value: "", label: "Todas las clínicas" },
              ...clinicOptions.map(({ id, name, active }) => ({
                value: id,
                label: active ? name : `${name} (inactiva)`,
              })),
            ]}
            showRequirement={false}
          />
        </div>
        <Button type="submit" size="sm" variant="secondary">
          Aplicar
        </Button>
      </div>
    </Form>
  );
}
