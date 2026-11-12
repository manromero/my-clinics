import { Badge } from "@/lib/components/badge/badge";
import { IconButton } from "@/lib/components/icon-button/icon-button";
import {
  formatActivityDate,
  formatActivityRate,
  formatEuroCents,
} from "../_lib/activity-format";
import type {
  ActivityClinicOption,
  ActivityRow,
  ActivityViewData,
} from "../_lib/activity-view";

function ActivityRowActions({
  row,
  label,
}: {
  row: ActivityRow;
  label: string;
}) {
  return (
    <div className="flex shrink-0 justify-end" data-activity-id={row.id}>
      <IconButton
        disabled
        size="sm"
        label={`Editar actividad de ${label}`}
        icon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m14 5 5 5M4 20l5-1 11-11a1.4 1.4 0 0 0 0-2l-2-2a1.4 1.4 0 0 0-2 0L5 15l-1 5Z" />
          </svg>
        }
      />
      <IconButton
        disabled
        size="sm"
        className="text-error"
        label={`Eliminar actividad de ${label}`}
        icon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16M10 7V4h4v3m4 0-1 13H7L6 7m4 4v5m4-5v5" />
          </svg>
        }
      />
    </div>
  );
}

const columns = [
  "Fecha",
  "Clínica",
  "Concepto",
  "Importe",
  "Cálculo",
  "Ganancia bruta",
  "IRPF aplicado",
  "Ganancia tras IRPF",
  "Acciones",
] as const;

const columnAlignment = [
  "text-left",
  "text-left",
  "text-left",
  "text-right",
  "text-left",
  "text-right",
  "text-right",
  "text-right",
  "text-right",
];

function activityRowDisplay(
  row: ActivityRow,
  clinic: ActivityClinicOption | undefined,
) {
  const date = formatActivityDate(row.date);
  const clinicName = clinic?.name ?? row.clinicId;
  const negative =
    row.priceCents.startsWith("-") || row.grossCents.startsWith("-");
  const rate =
    row.calculationMode === "percentage"
      ? formatActivityRate(row.appliedPercentageBasisPoints)
      : null;
  const amounts = [row.priceCents, row.grossCents, row.netCents].map(
    (cents) => (
      <span
        key={cents}
        className={`whitespace-nowrap tabular-nums ${cents.startsWith("-") ? "font-semibold text-on-error-container" : ""}`}
      >
        {formatEuroCents(cents)}
      </span>
    ),
  );
  return {
    negative,
    date: (
      <time className="whitespace-nowrap tabular-nums" dateTime={row.date}>
        {date}
      </time>
    ),
    clinic: (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-medium">{clinicName}</span>
        {clinic?.active === false && <Badge variant="inactive">Inactiva</Badge>}
      </div>
    ),
    concept: (
      <div className="space-y-2">
        <p className={row.description ? undefined : "text-on-surface-variant"}>
          {row.description || "Sin concepto"}
        </p>
        {negative && <Badge variant="negative">Importe negativo</Badge>}
      </div>
    ),
    amounts,
    mode:
      row.calculationMode === "percentage" ? "Porcentaje" : "Importe directo",
    rate,
    irpf: formatActivityRate(row.appliedIrpfBasisPoints),
    actions: (
      <ActivityRowActions
        row={row}
        label={`${clinicName}, ${date}${row.description ? `, ${row.description}` : ""}`}
      />
    ),
  };
}

export function ActivityList({
  rows,
  clinicOptions,
}: Pick<ActivityViewData, "rows" | "clinicOptions">) {
  const clinicsById = new Map(
    clinicOptions.map((clinic) => [clinic.id, clinic]),
  );
  const entries = rows.map((row) => ({
    id: row.id,
    ...activityRowDisplay(row, clinicsById.get(row.clinicId)),
  }));

  return (
    <>
      <div className="hidden rounded-xl bg-surface-container-low xl:block">
        <table aria-labelledby="activity-list" className="w-full text-label">
          <thead className="font-label text-caption font-semibold tracking-wide text-on-surface-variant uppercase">
            <tr>
              {columns.map((label, index) => (
                <th
                  key={label}
                  scope="col"
                  className={`px-3 py-4 ${columnAlignment[index]}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(
              ({
                id,
                negative,
                date,
                clinic,
                concept,
                amounts,
                mode,
                rate,
                irpf,
                actions,
              }) => {
                const cells = [
                  date,
                  clinic,
                  concept,
                  amounts[0],
                  <div key="mode">
                    <span>{mode}</span>
                    {rate && (
                      <div className="text-caption text-on-surface-variant">
                        {rate} aplicado
                      </div>
                    )}
                  </div>,
                  amounts[1],
                  irpf,
                  <strong key="net">{amounts[2]}</strong>,
                  actions,
                ];
                return (
                  <tr
                    key={id}
                    className={
                      negative
                        ? "bg-error-container/30"
                        : "bg-surface-container-lowest even:bg-surface/70"
                    }
                  >
                    {cells.map((cell, index) => (
                      <td
                        key={columns[index]}
                        className={`px-3 py-3 align-middle ${columnAlignment[index]}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
      <ul aria-labelledby="activity-list" className="space-y-3 xl:hidden">
        {entries.map(
          ({
            id,
            negative,
            date,
            clinic,
            concept,
            amounts,
            mode,
            rate,
            irpf,
            actions,
          }) => (
            <li
              key={id}
              className={`space-y-3 rounded-xl p-4 text-label ${negative ? "bg-error-container/30" : "bg-surface-container-low"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                {clinic}
                <span className="text-on-surface-variant">{date}</span>
              </div>
              <div className="font-semibold">{concept}</div>
              <dl className="grid grid-cols-3 gap-2">
                {["Importe", "Ganancia bruta", "Tras IRPF"].map(
                  (label, index) => (
                    <div
                      key={label}
                      className="flex min-w-0 flex-col justify-between gap-1"
                    >
                      <dt className="font-label text-caption text-on-surface-variant">
                        {label}
                      </dt>
                      <dd className={index === 2 ? "font-semibold" : undefined}>
                        {amounts[index]}
                      </dd>
                    </div>
                  ),
                )}
              </dl>
              <div className="flex items-start justify-between gap-2">
                <details className="min-w-0">
                  <summary className="min-h-11 cursor-pointer content-center rounded-sm font-label font-medium text-primary">
                    Detalles del cálculo
                  </summary>
                  <dl className="space-y-2 pb-1">
                    <div>
                      <dt className="text-caption text-on-surface-variant">
                        Modo de cálculo
                      </dt>
                      <dd>{mode}</dd>
                    </div>
                    {rate && (
                      <div>
                        <dt className="text-caption text-on-surface-variant">
                          Porcentaje aplicado
                        </dt>
                        <dd>{rate}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-caption text-on-surface-variant">
                        IRPF aplicado
                      </dt>
                      <dd>{irpf}</dd>
                    </div>
                  </dl>
                </details>
                {actions}
              </div>
            </li>
          ),
        )}
      </ul>
    </>
  );
}
