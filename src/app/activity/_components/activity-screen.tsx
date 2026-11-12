"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useRef, useState } from "react";
import { ActionLink } from "@/lib/components/action-link/action-link";
import { Alert } from "@/lib/components/alert/alert";
import { Button } from "@/lib/components/button/button";
import { ConfirmDialog } from "@/lib/components/confirm-dialog/confirm-dialog";
import { EmptyState } from "@/lib/components/empty-state/empty-state";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { Surface } from "@/lib/components/surface/surface";
import {
  activityMonthName,
  activityMonthKey,
  activityScopeParams,
  activityView,
  type ActivityClinicOption,
  type ActivityPreview,
  type ActivityRow,
  type ActivityScope,
  type ActivityViewData,
} from "../_lib/activity-view";
import {
  activityCount,
  formatActivityDate,
  formatEuroCents,
} from "../_lib/activity-format";
import { ActivityFilters } from "./activity-filters";
import { useActivityFixtureSession } from "./activity-fixture-session";
import { ActivityForm } from "./activity-form";
import { ActivityList, type ActivityRowAction } from "./activity-list";

type Operation =
  { kind: "create" } | { kind: "edit" | "delete"; row: ActivityRow };

function ActivityPreviewResults({
  data,
  clinics,
  preview,
  loading,
}: {
  data: ActivityViewData;
  clinics: readonly ActivityClinicOption[];
  preview?: ActivityPreview;
  loading?: Promise<void>;
}) {
  if (loading) use(loading);
  const { scope, clinicOptions, rows, totals, canCreate } = data;
  const session = useActivityFixtureSession();
  const [operation, setOperation] = useState<Operation | null>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState("");
  const inFlight = useRef<AbortController | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  const listHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => () => inFlight.current?.abort(), []);

  useEffect(() => {
    if (operation || !opener.current) return;
    const trigger = opener.current;
    opener.current = null;
    if (trigger.isConnected && trigger.getClientRects().length) {
      trigger.focus();
    } else if (createButton.current && !createButton.current.disabled) {
      createButton.current.focus();
    } else {
      listHeading.current?.focus();
    }
  }, [operation]);

  function openOperation(next: Operation, trigger: HTMLButtonElement) {
    opener.current = trigger;
    setNotice("");
    setFailed(false);
    setOperation(next);
  }

  const openRowAction: ActivityRowAction = (kind, row, trigger) => {
    openOperation({ kind, row }, trigger);
  };

  function closeOperation() {
    if (!inFlight.current) setOperation(null);
  }

  async function simulateWrite(commit: () => string) {
    if (inFlight.current) return;
    const request = new AbortController();
    inFlight.current = request;
    setPending(true);
    setFailed(false);
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (request.signal.aborted) return;

    inFlight.current = null;
    setPending(false);
    // This preview fails the first attempt in each dialog and allows retry.
    if (preview === "write-error" && !failed) {
      setFailed(true);
      return;
    }

    setNotice(commit());
    setOperation(null);
  }

  function save(entry: Omit<ActivityRow, "id">) {
    const row = operation?.kind === "edit" ? operation.row : undefined;
    void simulateWrite(() => {
      session.save(entry, row?.id);
      if (!entry.date.startsWith(`${activityMonthKey(scope)}-`)) {
        return `Actividad guardada en el periodo de la nueva fecha (${formatActivityDate(entry.date)}).`;
      }
      if (scope.clinicId && entry.clinicId !== scope.clinicId) {
        return "Actividad guardada en otra clínica. Cambia el filtro para verla.";
      }
      return "Actividad guardada.";
    });
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
          <h2
            ref={listHeading}
            id="activity-list"
            tabIndex={-1}
            className="font-headline text-title"
          >
            Registros de actividad
          </h2>
          <Button
            ref={createButton}
            disabled={!canCreate}
            onClick={(event) =>
              openOperation({ kind: "create" }, event.currentTarget)
            }
          >
            Nueva actividad
          </Button>
        </div>
        <div
          role="status"
          aria-atomic="true"
          className={
            notice
              ? "mb-4 rounded-lg bg-success-container px-4 py-3 text-label text-success xl:mx-6"
              : "sr-only"
          }
        >
          {notice}
        </div>
        {rows.length > 0 ? (
          <ActivityList
            rows={rows}
            clinicOptions={clinicOptions}
            onAction={openRowAction}
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
      </Surface>
      {operation?.kind === "delete" && (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) closeOperation();
          }}
          title="Eliminar actividad"
          description="Se eliminará este registro y se actualizarán los totales del periodo."
          confirmLabel="Eliminar"
          pendingLabel="Eliminando…"
          destructive
          error={
            failed
              ? "El registro sigue en la lista. Vuelve a intentarlo."
              : undefined
          }
          onConfirm={() =>
            simulateWrite(() => {
              session.remove(operation.row.id);
              return "Actividad eliminada.";
            })
          }
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg bg-surface-container-low p-4 text-sm [&>dt]:font-semibold">
            <dt>Fecha</dt>
            <dd>{formatActivityDate(operation.row.date)}</dd>
            <dt>Clínica</dt>
            <dd>
              {clinics.find(({ id }) => id === operation.row.clinicId)?.name}
            </dd>
            <dt>Importe</dt>
            <dd>{formatEuroCents(operation.row.priceCents)}</dd>
          </dl>
        </ConfirmDialog>
      )}
      {operation && operation.kind !== "delete" && (
        <ActivityForm
          row={operation.kind === "edit" ? operation.row : undefined}
          scope={scope}
          clinics={clinics}
          lastEntered={session.lastEnteredDates[activityMonthKey(scope)]}
          pending={pending}
          error={
            failed
              ? "Vuelve a intentarlo. Los datos introducidos siguen en el formulario."
              : undefined
          }
          onSave={save}
          onCancel={closeOperation}
        />
      )}
    </>
  );
}

export function ActivityScreen({
  scope: requestedScope,
  clinics,
  preview,
  loading,
}: {
  scope: ActivityScope;
  clinics: readonly ActivityClinicOption[];
  preview?: ActivityPreview;
  loading?: Promise<void>;
}) {
  const params = useSearchParams();
  const requestedClinic = params.get("clinic");
  const { rows } = useActivityFixtureSession();
  const data = activityView(
    requestedScope,
    requestedClinic ?? undefined,
    clinics,
    rows,
  );
  const { scope, clinicOptions } = data;
  const clinic = clinicOptions.find(({ id }) => id === scope.clinicId);
  const canonical = activityScopeParams(scope, preview);

  useEffect(() => {
    if (requestedClinic !== scope.clinicId) {
      window.history.replaceState(null, "", `/activity?${canonical}`);
    }
  }, [requestedClinic, scope.clinicId, canonical]);
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
        key={activityScopeParams(requestedScope, preview)}
        fallback={
          <LoadingState
            label="Cargando actividad…"
            variant="region"
            indicator="skeleton"
          />
        }
      >
        <ActivityPreviewResults
          data={data}
          clinics={clinics}
          preview={preview}
          loading={loading}
        />
      </Suspense>
    </PageContainer>
  );
}
