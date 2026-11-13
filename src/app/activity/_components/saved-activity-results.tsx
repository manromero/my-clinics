"use client";

import { useRef, useState, type ReactNode } from "react";
import { ActionLink } from "@/lib/components/action-link/action-link";
import { Alert } from "@/lib/components/alert/alert";
import { Button } from "@/lib/components/button/button";
import type { ActivityDraft } from "../_lib/activity-entry";
import type { ActivityRow, ActivityViewData } from "../_lib/activity-view";
import type { CreateActivityResult } from "../_lib/create-activity";
import { ActivityForm } from "./activity-form";
import { ActivityResults } from "./activity-results";

const saveErrors = {
  invalid:
    "Revisa la fecha, la clínica y los importes antes de volver a guardar.",
  "clinic-unavailable":
    "Esta clínica ya no está disponible. Selecciona otra clínica o vuelve a intentarlo si se reactiva.",
  "session-changed":
    "La sesión ha cambiado. Recarga la página para consultar tu actividad.",
  failed:
    "Vuelve a intentarlo. Los datos introducidos siguen en el formulario.",
};

export function SavedActivityResults({
  data,
  lastEntered,
  createActivityAction,
  pagination,
}: {
  data: ActivityViewData;
  lastEntered?: ActivityRow["date"];
  createActivityAction: (draft: ActivityDraft) => Promise<CreateActivityResult>;
  pagination?: ReactNode;
}) {
  const { scope, clinicOptions, canCreate } = data;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState("");
  const inFlight = useRef(false);

  async function save(draft: ActivityDraft) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(undefined);
    try {
      const result = await createActivityAction(draft);
      if (result.status !== "saved") {
        setError(saveErrors[result.status]);
        return;
      }

      setNotice(
        scope.clinicId && scope.clinicId !== draft.clinicId
          ? "Actividad guardada en otra clínica. Cambia el filtro para verla."
          : "Actividad guardada.",
      );
      setOpen(false);
    } catch {
      setError(saveErrors.failed);
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
        pagination={pagination}
        toolbar={
          <Button
            aria-haspopup="dialog"
            disabled={!canCreate}
            onClick={() => {
              setNotice("");
              setError(undefined);
              setOpen(true);
            }}
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
      {open && (
        <ActivityForm
          scope={scope}
          clinics={clinicOptions}
          lastEntered={lastEntered}
          pending={pending}
          error={error}
          onSave={save}
          onCancel={() => {
            if (!inFlight.current) setOpen(false);
          }}
        />
      )}
    </>
  );
}
