import { Badge } from "@/lib/components/badge/badge";
import { summaryMeasures, type SummaryViewData } from "../_lib/summary-view";

export function SummaryBreakdown({
  clinics,
  totals,
}: Pick<SummaryViewData, "clinics" | "totals">) {
  const totalMeasures = summaryMeasures(totals);
  const entries = [
    ...clinics.map(({ clinic, totals }) => ({
      id: clinic.id,
      title: clinic.name,
      status: !clinic.active
        ? "Inactiva"
        : totals.rowCount === 0
          ? "Sin actividad"
          : null,
      measures: summaryMeasures(totals),
    })),
    {
      id: "total",
      title: "Total consolidado",
      status: null,
      measures: totalMeasures,
    },
  ];

  return (
    <section aria-labelledby="summary-breakdown" className="space-y-4">
      <h2
        id="summary-breakdown"
        className="font-headline text-title font-semibold"
      >
        Desglose mensual por clínica
      </h2>
      <div className="overflow-hidden rounded-2xl bg-surface-container-low max-lg:hidden">
        <table
          aria-labelledby="summary-breakdown"
          className="w-full text-label"
        >
          <thead className="bg-surface-container font-label text-caption font-semibold tracking-wide text-on-surface-variant uppercase">
            <tr>
              <th scope="col" className="px-5 py-4 text-left">
                Clínica
              </th>
              {totalMeasures.map(({ label }) => (
                <th
                  key={label}
                  scope="col"
                  className="px-3 py-4 text-right last:pr-5"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(({ id, title, status, measures }) => (
              <tr
                key={id}
                className={
                  id === "total"
                    ? "bg-primary font-semibold text-on-primary"
                    : "bg-surface-container-lowest even:bg-surface/70"
                }
              >
                <th scope="row" className="px-5 py-4 text-left font-semibold">
                  {title}
                  {status && (
                    <Badge variant="inactive" className="ml-2">
                      {status}
                    </Badge>
                  )}
                </th>
                {measures.map(({ label, value, negative, highlighted }) => (
                  <td
                    key={label}
                    className={`px-3 py-4 text-right tabular-nums last:pr-5 ${id !== "total" && negative ? "text-error" : ""} ${highlighted ? "font-semibold" : ""}`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 lg:hidden">
        {entries.map(({ id, title, status, measures }) => (
          <li
            key={id}
            className={`rounded-xl p-4 ${id === "total" ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}
          >
            <h3 className="flex flex-wrap items-center gap-2 font-headline font-semibold">
              {title}
              {status && <Badge variant="inactive">{status}</Badge>}
            </h3>
            <dl className="mt-3 grid gap-1.5 text-label">
              {measures.map(({ label, value, negative, highlighted }) => (
                <div
                  key={label}
                  className={`flex items-baseline justify-between gap-4 ${highlighted ? "font-semibold" : ""}`}
                >
                  <dt>{label}</dt>
                  <dd
                    className={`text-right tabular-nums ${id !== "total" && negative ? "text-error" : ""}`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
