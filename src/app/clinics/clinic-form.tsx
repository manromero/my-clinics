import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  CLINIC_NAME_MAX_LENGTH,
  countClinicNameCharacters,
  type Clinic,
} from "@/lib/clinics/clinic";
import { Badge } from "@/lib/components/badge/badge";
import { DecimalInput } from "@/lib/components/decimal-input/decimal-input";
import { FormPanel } from "@/lib/components/form-panel/form-panel";
import { SegmentedControl } from "@/lib/components/segmented-control/segmented-control";
import { TextInput } from "@/lib/components/text-input/text-input";
import type { ClinicSaveResult } from "./clinic-write";

const stateOptions = [
  { value: "active", label: "Activa" },
  { value: "inactive", label: "Inactiva" },
];

export function ClinicForm({
  clinic,
  save,
  onCancel,
  onSaved,
}: {
  clinic?: Clinic;
  save: (data: FormData) => Promise<ClinicSaveResult>;
  onCancel: (result: ClinicSaveResult | null) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(clinic?.name ?? "");
  const [percentage, setPercentage] = useState(
    clinic ? clinic.percentage.toFixed(2).replace(".", ",") : "",
  );
  const [result, setResult] = useState<ClinicSaveResult | null>(null);
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const percentageInput = useRef<HTMLInputElement>(null);
  const focusError = useRef<"name" | "percentage" | null>(null);
  const fieldErrors = result?.status === "invalid" ? result : undefined;

  useEffect(() => {
    if (pending) return;
    if (focusError.current === "name") nameInput.current?.focus();
    else if (focusError.current === "percentage")
      percentageInput.current?.focus();
    focusError.current = null;
  }, [result, pending]);

  function clearFieldError(field: "nameError" | "percentageError") {
    setResult((previous) =>
      previous?.status === "invalid" && previous[field]
        ? { ...previous, [field]: undefined }
        : previous,
    );
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    let value = input.value;
    if (countClinicNameCharacters(value) > CLINIC_NAME_MAX_LENGTH) {
      // Preserve text after the insertion point when a paste or edit exceeds the limit.
      const cursor = input.selectionEnd ?? value.length;
      const suffix = [...value.slice(cursor)].slice(0, CLINIC_NAME_MAX_LENGTH);
      const remaining = CLINIC_NAME_MAX_LENGTH - suffix.length;
      const prefix = [...value.slice(0, cursor)].slice(0, remaining).join("");
      value = prefix + suffix.join("");
      input.value = value;
      input.setSelectionRange(prefix.length, prefix.length);
    }
    if (value !== name) {
      setName(value);
      clearFieldError("nameError");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (saving.current) return;
    const formData = new FormData(event.currentTarget);
    saving.current = true;
    setResult(null);
    setPending(true);
    try {
      const response = await save(formData);
      if (response.status === "saved") {
        onSaved();
      } else {
        if (response.status === "invalid") {
          focusError.current = response.nameError ? "name" : "percentage";
        }
        setResult(response);
      }
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
      title={clinic ? "Editar clínica" : "Nueva clínica"}
      description={
        clinic
          ? "Actualiza el nombre, el porcentaje por defecto o el estado del centro."
          : "Añade el nombre y el porcentaje por defecto del centro."
      }
      initialFocusRef={nameInput}
      noValidate
      onSubmit={handleSubmit}
      onCancel={() => onCancel(result)}
      pending={pending}
      error={
        result?.status === "failed"
          ? "Vuelve a intentarlo. Los datos introducidos siguen en el formulario."
          : result?.status === "missing"
            ? "Esta clínica ya no está disponible. Puedes copiar los datos introducidos antes de cerrar el formulario."
            : undefined
      }
    >
      <TextInput
        ref={nameInput}
        name="name"
        label="Nombre de la clínica"
        value={name}
        onChange={handleNameChange}
        help={`${countClinicNameCharacters(name)}/${CLINIC_NAME_MAX_LENGTH} caracteres`}
        required
        error={fieldErrors?.nameError}
      />
      <DecimalInput
        ref={percentageInput}
        name="percentage"
        label="Porcentaje por defecto"
        help={
          clinic
            ? "Entre 0 y 100, con hasta dos decimales. Las actividades existentes conservan su porcentaje."
            : "Entre 0 y 100, con hasta dos decimales."
        }
        value={percentage}
        onValueChange={(value) => {
          setPercentage(value);
          clearFieldError("percentageError");
        }}
        min="0"
        max="100"
        adornment="%"
        required
        error={fieldErrors?.percentageError}
      />
      {clinic ? (
        <div className="space-y-2">
          <SegmentedControl
            label="Estado del centro"
            name="active"
            options={stateOptions}
            defaultValue={clinic.active ? "active" : "inactive"}
          />
          <p className="text-sm leading-6 text-on-surface-variant">
            Las clínicas inactivas conservan su actividad existente y no
            permiten registrar nuevas actividades.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
          <span>Estado inicial</span>
          <Badge variant="active" dot>
            Activa
          </Badge>
        </div>
      )}
    </FormPanel>
  );
}
