"use client";

import { useState } from "react";
import { Alert } from "@/lib/components/alert/alert";
import { Button } from "@/lib/components/button/button";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { ClinicForm } from "./clinic-form";
import { createClinic } from "./create-clinic";

export function ClinicCreation() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Configuración de centros"
        title="Gestión de clínicas"
        description="Gestiona tus clínicas y sus porcentajes por defecto. Los cambios de porcentaje se aplican a las actividades nuevas."
        actions={
          <Button
            aria-haspopup="dialog"
            onClick={() => {
              setSaved(false);
              setOpen(true);
            }}
            startIcon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
          >
            Nueva clínica
          </Button>
        }
      />
      {open && (
        <ClinicForm
          save={createClinic}
          onCancel={() => setOpen(false)}
          onSaved={() => {
            setSaved(true);
            setOpen(false);
          }}
        />
      )}
      {saved && (
        <Alert title="Clínica guardada" variant="success" announcement="polite">
          La clínica se ha guardado y ya está activa.
        </Alert>
      )}
    </>
  );
}
