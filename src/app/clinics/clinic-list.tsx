"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Clinic } from "@/lib/clinics/clinic";
import { Alert } from "@/lib/components/alert/alert";
import { Badge } from "@/lib/components/badge/badge";
import { Button } from "@/lib/components/button/button";
import { EmptyState } from "@/lib/components/empty-state/empty-state";
import { Surface } from "@/lib/components/surface/surface";
import { ClinicForm } from "./clinic-form";
import { updateClinic } from "./update-clinic";

const percentageFormat = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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

export function ClinicList({ clinics }: { clinics: Clinic[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Clinic | null>(null);
  const [saved, setSaved] = useState(false);
  if (clinics.length === 0) {
    return (
      <EmptyState
        icon={<ClinicIcon />}
        title="Aún no hay clínicas"
        explanation="Las clínicas guardadas aparecerán aquí."
      />
    );
  }

  return (
    <section aria-labelledby="clinics-list" className="space-y-4">
      <h2 id="clinics-list" className="font-headline text-title">
        Todas las clínicas
      </h2>
      {clinics.every((clinic) => !clinic.active) && (
        <Alert title="Todas las clínicas están inactivas">
          No hay clínicas activas disponibles para registrar nueva actividad.
        </Alert>
      )}
      {saved && (
        <Alert
          title="Cambios guardados"
          variant="success"
          announcement="polite"
        >
          La clínica se ha actualizado.
        </Alert>
      )}
      {editing && (
        <ClinicForm
          clinic={editing}
          save={(formData) => updateClinic(editing.id, formData)}
          onCancel={(result) => {
            setEditing(null);
            if (result?.status === "missing") router.refresh();
          }}
          onSaved={() => {
            setEditing(null);
            setSaved(true);
          }}
        />
      )}
      <ul className="space-y-3">
        {clinics.map((clinic) => (
          <li key={clinic.id}>
            <Surface
              variant={clinic.active ? "white" : "tonal"}
              className="sm:p-5!"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2 sm:items-center sm:gap-x-4">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ClinicIcon />
                </span>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="min-w-0 font-headline text-lg font-semibold wrap-anywhere">
                      {clinic.name}
                    </h3>
                    <Badge variant={clinic.active ? "active" : "inactive"} dot>
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
                <Button
                  variant="tertiary"
                  size="sm"
                  aria-label={`Editar ${clinic.name}`}
                  aria-haspopup="dialog"
                  onClick={() => {
                    setSaved(false);
                    setEditing(clinic);
                  }}
                  startIcon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m14 6 4 4M4 20l4-.8L20 7a2.8 2.8 0 0 0-4-4L4.8 15 4 20Z" />
                    </svg>
                  }
                >
                  Editar
                </Button>
              </div>
            </Surface>
          </li>
        ))}
      </ul>
    </section>
  );
}
