"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Alert } from "@/lib/components/alert/alert";
import { Badge } from "@/lib/components/badge/badge";
import { Button } from "@/lib/components/button/button";
import { DecimalInput } from "@/lib/components/decimal-input/decimal-input";
import { FormPanel } from "@/lib/components/form-panel/form-panel";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { TextInput } from "@/lib/components/text-input/text-input";
import { createClinic, type CreateClinicResult } from "./create-clinic";

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

function ClinicForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [percentage, setPercentage] = useState("");
  const [result, setResult] = useState<CreateClinicResult | null>(null);
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const percentageInput = useRef<HTMLInputElement>(null);
  const fieldErrors = result?.status === "invalid" ? result : undefined;

  useEffect(() => {
    if (pending) return;
    if (fieldErrors?.nameError) nameInput.current?.focus();
    else if (fieldErrors?.percentageError) percentageInput.current?.focus();
  }, [fieldErrors, pending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (saving.current) return;
    const formData = new FormData(event.currentTarget);
    saving.current = true;
    setResult(null);
    setPending(true);
    try {
      const response = await createClinic(formData);
      if (response.status === "saved") onSaved();
      else setResult(response);
    } catch {
      setResult({ status: "failed" });
    } finally {
      saving.current = false;
      setPending(false);
    }
  }

  return (
    <FormPanel
      presentation="modal"
      open
      title="Nueva clínica"
      description="Añade el nombre y el porcentaje por defecto del centro."
      initialFocusRef={nameInput}
      noValidate
      onSubmit={handleSubmit}
      onCancel={onCancel}
      pending={pending}
      error={
        result?.status === "failed"
          ? "Vuelve a intentarlo. Los datos introducidos siguen en el formulario."
          : undefined
      }
    >
      <TextInput
        ref={nameInput}
        name="name"
        label="Nombre de la clínica"
        required
        error={fieldErrors?.nameError}
      />
      <DecimalInput
        ref={percentageInput}
        name="percentage"
        label="Porcentaje por defecto"
        help="Entre 0 y 100, con hasta dos decimales."
        value={percentage}
        onValueChange={setPercentage}
        min="0"
        max="100"
        adornment="%"
        required
        error={fieldErrors?.percentageError}
      />
      <div className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
        <span>Estado inicial</span>
        <Badge variant="active" dot>
          Activa
        </Badge>
      </div>
    </FormPanel>
  );
}
