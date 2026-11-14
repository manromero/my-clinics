import { Surface } from "@/lib/components/surface/surface";
import { formatEuroCents } from "@/lib/format/amounts";
import type { SummaryViewData } from "../_lib/summary-view";

function magnitude(amount: bigint) {
  return amount < BigInt(0) ? -amount : amount;
}

function ComparisonBar({
  amount,
  scale,
  centered,
  color,
}: {
  amount: bigint;
  scale: bigint;
  centered: boolean;
  color: string;
}) {
  const width = Number((magnitude(amount) * BigInt(10_000)) / scale) / 100;
  return (
    <div className="relative h-2 rounded-full bg-surface-container-low">
      {centered && (
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-on-surface-variant/50" />
      )}
      {amount !== BigInt(0) && (
        <span
          className={`absolute inset-y-0 min-w-0.5 rounded-full ${color}`}
          style={{
            width: `${centered ? width / 2 : width}%`,
            ...(amount < BigInt(0)
              ? { right: "50%" }
              : { left: centered ? "50%" : 0 }),
          }}
        />
      )}
    </div>
  );
}

export function SummaryComparison({
  clinics,
}: Pick<SummaryViewData, "clinics">) {
  const amounts = clinics.flatMap(({ totals }) => [
    totals.priceCents,
    totals.netCents,
  ]);
  const centered = amounts.some((amount) => amount < BigInt(0));
  const scale = amounts.reduce(
    (largest, amount) =>
      magnitude(amount) > largest ? magnitude(amount) : largest,
    BigInt(1),
  );

  return (
    <Surface
      as="section"
      aria-labelledby="summary-comparison"
      className="sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="summary-comparison"
          className="font-headline text-title font-semibold"
        >
          Importes y ganancias por clínica
        </h2>
        <div
          className="flex flex-wrap gap-x-4 gap-y-1 text-caption font-medium text-on-surface-variant"
          aria-hidden="true"
        >
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-on-surface-variant/60" />{" "}
            Importe total
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" /> Ganancia tras
            IRPF
          </span>
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {clinics.map(({ clinic, totals }) => (
          <li
            key={clinic.id}
            className="space-y-2.5 rounded-xl bg-surface/80 px-3.5 py-3 sm:px-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
              <p className="text-label font-semibold">
                {clinic.name}
                {!clinic.active && (
                  <span className="ml-2 text-caption font-normal text-on-surface-variant">
                    Inactiva
                  </span>
                )}
              </p>
              <dl className="flex flex-wrap gap-x-4 gap-y-1 text-label tabular-nums">
                <div>
                  <dt className="sr-only">Importe total</dt>
                  <dd
                    className={`flex items-center gap-1.5 ${totals.priceCents < BigInt(0) ? "font-semibold text-error" : "text-on-surface-variant"}`}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full bg-on-surface-variant/60"
                    />
                    {formatEuroCents(`${totals.priceCents}`)}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Ganancia tras IRPF</dt>
                  <dd
                    className={`flex items-center gap-1.5 font-semibold ${totals.netCents < BigInt(0) ? "text-error" : "text-on-surface"}`}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full bg-primary"
                    />
                    {formatEuroCents(`${totals.netCents}`)}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="space-y-1" aria-hidden="true">
              <ComparisonBar
                amount={totals.priceCents}
                scale={scale}
                centered={centered}
                color="bg-on-surface-variant/60"
              />
              <ComparisonBar
                amount={totals.netCents}
                scale={scale}
                centered={centered}
                color="bg-primary"
              />
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
