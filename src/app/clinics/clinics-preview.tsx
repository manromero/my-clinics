"use client";

import { useRef, useState } from "react";
import { Badge } from "@/lib/components/badge/badge";
import { Button } from "@/lib/components/button/button";
import { DecimalInput } from "@/lib/components/decimal-input/decimal-input";
import { EmptyState } from "@/lib/components/empty-state/empty-state";
import { FormPanel } from "@/lib/components/form-panel/form-panel";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { SegmentedControl } from "@/lib/components/segmented-control/segmented-control";
import { Surface } from "@/lib/components/surface/surface";
import { TextInput } from "@/lib/components/text-input/text-input";

export type SampleClinic = {
  id: string;
  name: string;
  percentage: number;
  active: boolean;
};

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
  onCancel,
}: {
  clinic?: SampleClinic;
  onCancel: () => void;
}) {
  const nameInput = useRef<HTMLInputElement>(null);
  const [percentage, setPercentage] = useState(
    clinic ? percentageFormat.format(clinic.percentage) : "",
  );

  return (
    <FormPanel
      presentation="modal"
      open
      title={clinic ? "Editar clínica" : "Nueva clínica"}
      description="Vista previa. Los cambios de este formulario no se guardan."
      initialFocusRef={nameInput}
      onCancel={onCancel}
      onSubmit={() => {}}
      noValidate
    >
      <TextInput
        ref={nameInput}
        label="Nombre de la clínica"
        name="name"
        defaultValue={clinic?.name}
        placeholder="Ej. Clínica Dental Alameda"
        required
      />
      <DecimalInput
        label="Porcentaje por defecto"
        name="percentage"
        value={percentage}
        onValueChange={setPercentage}
        adornment="%"
        placeholder="Ej. 28,50"
        help="Entre 0 y 100 %. Los cambios se aplican a las actividades nuevas."
        required
      />
      <div className="space-y-2">
        <SegmentedControl
          label="Estado de la clínica"
          name="state"
          options={clinicStates}
          defaultValue={clinic?.active === false ? "inactive" : "active"}
        />
        <p className="text-label text-on-surface-variant">
          Desactivar una clínica conserva su actividad anterior e impide
          registrar nuevas actividades en ella.
        </p>
      </div>
    </FormPanel>
  );
}

export function ClinicsPreview({
  clinics,
}: {
  clinics: readonly SampleClinic[];
}) {
  const [selection, setSelection] = useState<SampleClinic | "new" | null>(null);
  const openCreate = () => setSelection("new");

  return (
    <PageContainer as="main" className="flex-1 space-y-8">
      <PageHeader
        eyebrow="Configuración de centros"
        title="Gestión de clínicas"
        description="Consulta tus clínicas y sus porcentajes por defecto. Los cambios de porcentaje se aplican a las actividades nuevas."
        actions={
          clinics.length > 0 && (
            <Button onClick={openCreate}>Nueva clínica</Button>
          )
        }
      />
      {clinics.length > 0 ? (
        <section aria-labelledby="clinics-list" className="space-y-4">
          <h2 id="clinics-list" className="font-headline text-title">
            Todas las clínicas
          </h2>
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
                        <h3 className="font-headline text-lg font-semibold">
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
                        onClick={() => setSelection(clinic)}
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
          action={{ label: "Nueva clínica", onClick: openCreate }}
        />
      )}
      {selection && (
        <ClinicForm
          clinic={selection === "new" ? undefined : selection}
          onCancel={() => setSelection(null)}
        />
      )}
    </PageContainer>
  );
}
