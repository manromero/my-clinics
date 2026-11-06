"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Alert } from "@/lib/components/alert/alert";
import { Badge } from "@/lib/components/badge/badge";
import { Button } from "@/lib/components/button/button";
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
}: {
  clinic?: Clinic;
  source: ClinicSource;
  onCancel: () => void;
  onSaved: (clinic: Clinic) => void;
}) {
  const nameInput = useRef<HTMLInputElement>(null);
  const percentageInput = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
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

  useEffect(() => {
    if (pending) return;
    if (errors.name) nameInput.current?.focus();
    else if (errors.percentage) percentageInput.current?.focus();
  }, [errors, pending]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    if (submitting.current) return;
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

  return (
    <FormPanel
      presentation="modal"
      open
      title={clinic ? "Editar clínica" : "Nueva clínica"}
      initialFocusRef={nameInput}
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
    </FormPanel>
  );
}

export function ClinicsPreview({
  initialClinics,
  failure,
}: {
  initialClinics: readonly Clinic[];
  failure?: ClinicFailure;
}) {
  const [source] = useState(() =>
    createMemoryClinicSource(initialClinics, { failure }),
  );
  const [load, setLoad] = useState<Awaited<
    ReturnType<ClinicSource["list"]>
  > | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [selection, setSelection] = useState<Clinic | "new" | null>(null);
  const [saved, setSaved] = useState<Clinic>();
  const createButton = useRef<HTMLButtonElement>(null);
  const restoreCreateFocus = useRef(false);

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
  }, [saved]);

  const clinics = load?.status === "loaded" ? load.clinics : [];

  function openForm(selection: Clinic | "new") {
    setSaved(undefined);
    setSelection(selection);
  }

  function saveClinic(clinic: Clinic) {
    restoreCreateFocus.current = clinics.length === 0;
    const updated =
      selection === "new"
        ? [...clinics, clinic]
        : clinics.map((entry) => (entry.id === clinic.id ? clinic : entry));
    setLoad({ status: "loaded", clinics: updated });
    setSelection(null);
    setSaved(clinic);
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
      {saved && (
        <Alert title="Clínica guardada" variant="success" announcement="polite">
          Se guardaron los cambios de {saved.name}.
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
        />
      )}
    </PageContainer>
  );
}
