"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Alert } from "@/lib/components/alert/alert";
import { Badge } from "@/lib/components/badge/badge";
import { Button } from "@/lib/components/button/button";
import { ConfirmDialog } from "@/lib/components/confirm-dialog/confirm-dialog";
import { DecimalInput } from "@/lib/components/decimal-input/decimal-input";
import { EmptyState } from "@/lib/components/empty-state/empty-state";
import { FormPanel } from "@/lib/components/form-panel/form-panel";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { SegmentedControl } from "@/lib/components/segmented-control/segmented-control";
import { Surface } from "@/lib/components/surface/surface";
import { TextInput } from "@/lib/components/text-input/text-input";
import {
  parseClinicPercentage,
  type Clinic,
  type ClinicSource,
} from "./clinic-source";
import {
  createMemoryClinicSource,
  type ClinicFailure,
} from "./memory-clinic-source";

const percentageFormat = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const clinicStates = [
  { value: "active", label: "Activa" },
  { value: "inactive", label: "Inactiva" },
];

function ClinicIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8m-4-4h8" />
    </svg>
  );
}

function ClinicForm({
  clinic,
  source,
  onCancel,
  onSaved,
  onDeleted,
}: {
  clinic?: Clinic;
  source: ClinicSource;
  onCancel: () => void;
  onSaved: (clinic: Clinic) => void;
  onDeleted: (clinic: Clinic) => void;
}) {
  const nameInput = useRef<HTMLInputElement>(null);
  const percentageInput = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const linkedActivityMessage = useRef<HTMLParagraphElement>(null);
  const [deleteStage, setDeleteStage] = useState<"edit" | "confirm" | "return">(
    "edit",
  );
  const [deleteError, setDeleteError] = useState<string>();
  const [deleteBlocked, setDeleteBlocked] = useState(false);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [errors, setErrors] = useState<{ name?: string; percentage?: string }>(
    {},
  );
  const [percentage, setPercentage] = useState(
    clinic ? percentageFormat.format(clinic.percentage) : "",
  );

  const nameError = "Introduce el nombre de la clínica.";
  const percentageError =
    "Introduce un porcentaje entre 0 y 100 con hasta dos decimales.";
  const deletion = source.deletion;
  const hasLinkedActivity =
    deleteBlocked || (clinic && deletion?.hasLinkedActivity(clinic.id));

  useEffect(() => {
    if (pending) return;
    if (errors.name) nameInput.current?.focus();
    else if (errors.percentage) percentageInput.current?.focus();
  }, [errors, pending]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    if (submitting.current || deleteStage === "confirm") return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const parsed = parseClinicPercentage(percentage);
    setSaveError(undefined);
    setErrors({
      name: name ? undefined : nameError,
      percentage: parsed.status === "valid" ? undefined : percentageError,
    });
    if (!name || parsed.status !== "valid") return;

    submitting.current = true;
    setPending(true);
    const details = { name, percentage: Number(parsed.decimal) };
    const result = clinic
      ? await source.update(clinic.id, {
          ...details,
          active: data.get("state") === "active",
        })
      : await source.create(details);
    submitting.current = false;
    setPending(false);

    switch (result.status) {
      case "saved":
        onSaved(result.clinic);
        break;
      case "duplicate-name":
        setErrors({ name: "Ya existe una clínica con ese nombre." });
        break;
      case "invalid":
        setErrors({
          [result.field]: result.field === "name" ? nameError : percentageError,
        });
        break;
      case "failed":
        setSaveError(
          "Tus cambios siguen en el formulario. Vuelve a pulsar Guardar para reintentar.",
        );
        break;
    }
  }

  async function deleteClinic() {
    if (!clinic || !deletion) return;
    setDeleteError(undefined);
    const result = await deletion
      .remove(clinic.id)
      .catch(() => ({ status: "failed" }) as const);

    switch (result.status) {
      case "deleted":
        onDeleted(clinic);
        break;
      case "linked-activity":
        setDeleteBlocked(true);
        setDeleteStage("return");
        break;
      case "failed":
        setDeleteError(
          "La clínica se conserva. Vuelve a pulsar Eliminar clínica para reintentar.",
        );
        break;
    }
  }

  return (
    <>
      {/* Keep the draft mounted while only one modal is open. */}
      <FormPanel
        presentation="modal"
        open={deleteStage !== "confirm"}
        title={clinic ? "Editar clínica" : "Nueva clínica"}
        initialFocusRef={
          deleteStage === "return"
            ? hasLinkedActivity
              ? linkedActivityMessage
              : deleteButton
            : nameInput
        }
        onCancel={onCancel}
        onSubmit={submit}
        pending={pending}
        error={saveError}
        noValidate
      >
        <TextInput
          ref={nameInput}
          label="Nombre de la clínica"
          name="name"
          defaultValue={clinic?.name}
          placeholder="Ej. Clínica Dental Alameda"
          error={errors.name}
          required
        />
        <DecimalInput
          ref={percentageInput}
          label="Porcentaje por defecto"
          name="percentage"
          value={percentage}
          onValueChange={setPercentage}
          adornment="%"
          placeholder="Ej. 28,50"
          help="Entre 0 y 100 %. Los cambios se aplican a las actividades nuevas."
          error={errors.percentage}
          required
        />
        <div className="space-y-2">
          <SegmentedControl
            label="Estado de la clínica"
            name="state"
            options={clinicStates}
            defaultValue={clinic?.active === false ? "inactive" : "active"}
            disabled={!clinic}
          />
          <p className="text-label text-on-surface-variant">
            {clinic
              ? "Desactivar una clínica conserva su actividad anterior e impide registrar nuevas actividades en ella."
              : "Las clínicas nuevas se crean activas."}
          </p>
        </div>
        {clinic && deletion && (
          <div className="rounded-lg bg-surface-container-low p-4">
            {hasLinkedActivity ? (
              <p
                ref={linkedActivityMessage}
                tabIndex={-1}
                className="text-label text-on-surface-variant"
              >
                Esta clínica tiene actividad registrada y no se puede eliminar.
              </p>
            ) : (
              <Button
                ref={deleteButton}
                variant="destructive"
                onClick={() => {
                  if (submitting.current) return;
                  setDeleteError(undefined);
                  setDeleteStage("confirm");
                }}
              >
                Eliminar clínica
              </Button>
            )}
          </div>
        )}
      </FormPanel>
      {clinic && deleteStage === "confirm" && (
        <ConfirmDialog
          open
          title="Eliminar clínica"
          description="Esta acción es permanente."
          destructive
          confirmLabel="Eliminar clínica"
          pendingLabel="Eliminando…"
          error={deleteError}
          onOpenChange={() => setDeleteStage("return")}
          onConfirm={deleteClinic}
        >
          <p className="text-sm leading-6 text-on-surface-variant">
            Clínica que se eliminará
            <strong className="block text-on-surface">{clinic.name}</strong>
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}

export function ClinicsPreview({
  initialClinics,
  linkedClinicIds,
  failure,
}: {
  initialClinics: readonly Clinic[];
  linkedClinicIds?: readonly string[];
  failure?: ClinicFailure;
}) {
  const [source] = useState(() =>
    createMemoryClinicSource(initialClinics, {
      failure,
      linkedClinicIds: new Set(linkedClinicIds),
    }),
  );
  const [load, setLoad] = useState<Awaited<
    ReturnType<ClinicSource["list"]>
  > | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [selection, setSelection] = useState<Clinic | "new" | null>(null);
  const [saved, setSaved] = useState<{ clinic: Clinic; created: boolean }>();
  const [deleted, setDeleted] = useState<Clinic>();
  const createButton = useRef<HTMLButtonElement>(null);
  const restoreCreateFocus = useRef(false);
  const editConfirmation = useRef<HTMLDivElement>(null);
  const deleteConfirmation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let current = true;
    void source.list().then((result) => {
      if (current) setLoad(result);
    });
    return () => {
      current = false;
    };
  }, [source, attempt]);

  useEffect(() => {
    if (restoreCreateFocus.current && createButton.current) {
      restoreCreateFocus.current = false;
      createButton.current.focus();
    }
    editConfirmation.current?.scrollIntoView({ block: "nearest" });
  }, [saved]);

  useEffect(() => {
    if (deleted) deleteConfirmation.current?.focus();
  }, [deleted]);

  const clinics = load?.status === "loaded" ? load.clinics : [];

  function openForm(selection: Clinic | "new") {
    setSaved(undefined);
    setDeleted(undefined);
    setSelection(selection);
  }

  function removeClinic(clinic: Clinic) {
    setLoad({
      status: "loaded",
      clinics: clinics.filter((entry) => entry.id !== clinic.id),
    });
    setSelection(null);
    setDeleted(clinic);
  }

  function saveClinic(clinic: Clinic) {
    restoreCreateFocus.current = clinics.length === 0;
    const created = selection === "new";
    const updated = created
      ? [...clinics, clinic]
      : clinics.map((entry) => (entry.id === clinic.id ? clinic : entry));
    setLoad({ status: "loaded", clinics: updated });
    setSelection(null);
    setSaved({ clinic, created });
  }

  return (
    <PageContainer as="main" className="flex-1 space-y-8">
      <PageHeader
        eyebrow="Configuración de centros"
        title="Gestión de clínicas"
        description="Consulta tus clínicas y sus porcentajes por defecto. Los cambios de porcentaje se aplican a las actividades nuevas."
        actions={
          clinics.length > 0 && (
            <Button ref={createButton} onClick={() => openForm("new")}>
              Nueva clínica
            </Button>
          )
        }
      />
      {saved?.created && (
        <Alert title="Clínica guardada" variant="success" announcement="polite">
          Se guardaron los cambios de {saved.clinic.name}.
        </Alert>
      )}
      {deleted && (
        <Alert
          ref={deleteConfirmation}
          tabIndex={-1}
          title="Clínica eliminada"
          variant="success"
          announcement="polite"
        >
          Se eliminó {deleted.name}.
        </Alert>
      )}
      {load === null ? (
        <LoadingState label="Cargando clínicas…" variant="region" />
      ) : load.status === "failed" ? (
        <Alert
          title="No se pudieron cargar las clínicas"
          variant="error"
          announcement="assertive"
          action={{
            label: "Reintentar",
            onClick: () => {
              setLoad(null);
              setAttempt((current) => current + 1);
            },
          }}
        >
          Vuelve a intentarlo para consultar tus clínicas.
        </Alert>
      ) : clinics.length > 0 ? (
        <section aria-labelledby="clinics-list" className="space-y-4">
          <h2 id="clinics-list" className="font-headline text-title">
            Todas las clínicas
          </h2>
          {clinics.every((clinic) => !clinic.active) && (
            <Alert title="Todas las clínicas están inactivas">
              Edita una clínica para volver a activarla.
            </Alert>
          )}
          <ul className="space-y-3">
            {clinics.map((clinic) => (
              <li key={clinic.id}>
                <Surface
                  variant={clinic.active ? "white" : "tonal"}
                  className="sm:p-5!"
                >
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ClinicIcon />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="min-w-0 font-headline text-lg font-semibold wrap-anywhere">
                          {clinic.name}
                        </h3>
                        <Badge
                          variant={clinic.active ? "active" : "inactive"}
                          dot
                        >
                          {clinic.active ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                      <p className="font-label text-label text-on-surface-variant">
                        Porcentaje por defecto{" "}
                        <strong className="ml-1 whitespace-nowrap text-on-surface">
                          {percentageFormat.format(clinic.percentage)} %
                        </strong>
                      </p>
                    </div>
                    <div className="col-start-2 sm:col-start-3">
                      <Button
                        variant="secondary"
                        aria-label={`Editar ${clinic.name}`}
                        onClick={() => openForm(clinic)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                  {saved && !saved.created && saved.clinic.id === clinic.id && (
                    <Alert
                      ref={editConfirmation}
                      title="Clínica guardada"
                      variant="success"
                      announcement="polite"
                      className="mt-3 scroll-m-4"
                    >
                      Se guardaron los cambios.
                    </Alert>
                  )}
                </Surface>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <EmptyState
          icon={<ClinicIcon />}
          title="Aún no hay clínicas"
          explanation="Añade una clínica para preparar el registro de actividad."
          action={{ label: "Nueva clínica", onClick: () => openForm("new") }}
        />
      )}
      {selection && (
        <ClinicForm
          clinic={selection === "new" ? undefined : selection}
          source={source}
          onCancel={() => setSelection(null)}
          onSaved={saveClinic}
          onDeleted={removeClinic}
        />
      )}
    </PageContainer>
  );
}
