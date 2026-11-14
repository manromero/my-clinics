"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActionLink } from "@/lib/components/action-link/action-link";
import { Alert } from "@/lib/components/alert/alert";
import { Button } from "@/lib/components/button/button";
import { ConfirmDialog } from "@/lib/components/confirm-dialog/confirm-dialog";
import type { ActivityDraft } from "../_lib/activity-entry";
import { formatActivityDate, formatEuroCents } from "../_lib/activity-format";
import {
  activityMonthKey,
  type ActivityRow,
  type ActivityViewData,
} from "../_lib/activity-view";
import type { ActivityWriteResult } from "../_lib/write-activity";
import { ActivityForm } from "./activity-form";
import type { ActivityRowAction } from "./activity-list";
import { ActivityResults } from "./activity-results";

type Operation =
  { kind: "create" } | { kind: "edit" | "delete"; row: ActivityRow };

const writeErrors = {
  invalid:
    "Revisa la fecha, la clínica y los importes antes de volver a guardar.",
  "clinic-unavailable":
    "Esta clínica ya no está disponible. Selecciona otra clínica o vuelve a intentarlo si se reactiva.",
  "activity-unavailable":
    "El registro ya no está disponible. Recarga la actividad para actualizar la lista.",
  "edit-unavailable":
    "El registro o la clínica ya no están disponibles para este cambio. Revisa la clínica o cancela y recarga la actividad.",
  "session-changed":
    "La sesión ha cambiado. Recarga la página para consultar tu actividad.",
  failed:
    "Vuelve a intentarlo. Los datos introducidos siguen en el formulario.",
};

function savedNotice(scope: ActivityViewData["scope"], draft: ActivityDraft) {
  const changedMonth = !draft.date.startsWith(`${activityMonthKey(scope)}-`);
  const changedClinic =
    scope.clinicId !== null && scope.clinicId !== draft.clinicId;
  if (changedMonth && changedClinic) {
    return `Actividad guardada con fecha ${formatActivityDate(draft.date)} en otra clínica. Cambia el periodo y el filtro para verla.`;
  }
  if (changedMonth) {
    return `Actividad guardada con fecha ${formatActivityDate(draft.date)}. Cambia el periodo para verla.`;
  }
  if (changedClinic) {
    return "Actividad guardada en otra clínica. Cambia el filtro para verla.";
  }
  return "Actividad guardada.";
}

export function SavedActivityResults({
  data,
  lastEntered,
  saveActivityAction,
  deleteActivityAction,
  pagination,
}: {
  data: ActivityViewData;
  lastEntered?: ActivityRow["date"];
  saveActivityAction: (
    draft: ActivityDraft,
    id?: string,
  ) => Promise<ActivityWriteResult>;
  deleteActivityAction: (id: string) => Promise<ActivityWriteResult>;
  pagination?: ReactNode;
}) {
  const { scope, clinicOptions, canCreate } = data;
  const [operation, setOperation] = useState<Operation | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState("");
  const inFlight = useRef(false);
  const opener = useRef<HTMLButtonElement>(null);
  const listHeading = useRef<HTMLHeadingElement>(null);
  const row = operation && "row" in operation ? operation.row : undefined;
  const deleting = operation?.kind === "delete";

  useEffect(() => {
    if (operation || !opener.current) return;
    const trigger = opener.current;
    opener.current = null;
    if (trigger.isConnected && trigger.getClientRects().length) {
      trigger.focus();
    } else {
      listHeading.current?.focus();
    }
  }, [operation]);

  function openOperation(next: Operation, trigger: HTMLButtonElement) {
    opener.current = trigger;
    setNotice("");
    setError(undefined);
    setOperation(next);
  }

  const openRowAction: ActivityRowAction = (kind, row, trigger) => {
    openOperation({ kind, row }, trigger);
  };

  function closeOperation() {
    if (!inFlight.current) setOperation(null);
  }

  async function write(
    action: () => Promise<ActivityWriteResult>,
    success: string,
    failure: string,
  ) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(undefined);
    try {
      const result = await action();
      if (result !== "saved") {
        setError(
          result === "failed" || (deleting && result === "invalid")
            ? failure
            : writeErrors[result],
        );
        return;
      }

      setNotice(success);
      setOperation(null);
    } catch {
      setError(failure);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <>
      {!canCreate && (
        <Alert title="No hay clínicas activas" variant="warning">
          <p>
            Crea una clínica o reactiva una existente para registrar actividad.
          </p>
          <ActionLink href="/clinics">Ir a Clínicas</ActionLink>
        </Alert>
      )}
      <ActivityResults
        data={data}
        listHeading={listHeading}
        onAction={openRowAction}
        pagination={pagination}
        toolbar={
          <Button
            aria-haspopup="dialog"
            disabled={!canCreate}
            onClick={(event) =>
              openOperation({ kind: "create" }, event.currentTarget)
            }
          >
            Nueva actividad
          </Button>
        }
        notice={
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
        }
      />
      {deleting && row && (
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
          pending={pending}
          error={error}
          onConfirm={() =>
            write(
              () => deleteActivityAction(row.id),
              "Actividad eliminada.",
              "Vuelve a intentarlo para eliminar el registro.",
            )
          }
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg bg-surface-container-low p-4 text-sm [&>dt]:font-semibold">
            <dt>Fecha</dt>
            <dd>{formatActivityDate(row.date)}</dd>
            <dt>Clínica</dt>
            <dd>{clinicOptions.find(({ id }) => id === row.clinicId)?.name}</dd>
            <dt>Importe</dt>
            <dd>{formatEuroCents(row.priceCents)}</dd>
          </dl>
        </ConfirmDialog>
      )}
      {operation && !deleting && (
        <ActivityForm
          row={row}
          scope={scope}
          clinics={clinicOptions}
          lastEntered={lastEntered}
          pending={pending}
          error={error}
          onSave={(draft) =>
            write(
              () => saveActivityAction(draft, row?.id),
              savedNotice(scope, draft),
              "Vuelve a intentarlo. Los datos introducidos siguen en el formulario.",
            )
          }
          onCancel={closeOperation}
        />
      )}
    </>
  );
}
