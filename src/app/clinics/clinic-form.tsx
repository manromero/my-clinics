import {
  useContext,
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
import { Button } from "@/lib/components/button/button";
import { ConfirmDialog } from "@/lib/components/confirm-dialog/confirm-dialog";
import { DecimalInput } from "@/lib/components/decimal-input/decimal-input";
import { FormPanel } from "@/lib/components/form-panel/form-panel";
import { SegmentedControl } from "@/lib/components/segmented-control/segmented-control";
import { TextInput } from "@/lib/components/text-input/text-input";
import { ConcealSignedInContent } from "../_components/signed-in-history-guard";
import type { ClinicSaveResult } from "./clinic-write";
import type { ClinicDeleteResult } from "./delete-clinic";

const stateOptions = [
  { value: "active", label: "Activa" },
  { value: "inactive", label: "Inactiva" },
];

export function ClinicForm({
  clinic,
  save,
  deletion,
  onCancel,
  onSaved,
}: {
  clinic?: Clinic;
  save: (data: FormData) => Promise<ClinicSaveResult>;
  deletion?: {
    remove: () => Promise<ClinicDeleteResult>;
    onDeleted: () => void;
  };
  onCancel: (result: ClinicSaveResult | null) => void;
  onSaved: () => void;
}) {
  const conceal = useContext(ConcealSignedInContent);
  const [name, setName] = useState(clinic?.name ?? "");
  const [percentage, setPercentage] = useState(
    clinic ? clinic.percentage.toFixed(2).replace(".", ",") : "",
  );
  const [result, setResult] = useState<ClinicSaveResult | null>(null);
  const [pending, setPending] = useState(false);
  const [deleteStage, setDeleteStage] = useState<"edit" | "confirm" | "return">(
    "edit",
  );
  const [deleteError, setDeleteError] = useState<string>();
  const [deleteBlocked, setDeleteBlocked] = useState(false);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const linkedActivityMessage = useRef<HTMLParagraphElement>(null);
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
    if (saving.current || deleteStage === "confirm") return;
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

  async function handleDelete() {
    if (!deletion) return;
    setDeleteError(undefined);
    const response = await deletion.remove().catch(() => "failed" as const);
    switch (response) {
      case "deleted":
        deletion.onDeleted();
        break;
      case "linked-activity":
        setDeleteBlocked(true);
        setDeleteStage("return");
        break;
      case "session-changed":
        conceal();
        window.location.reload();
        break;
      case "missing":
        setResult({ status: "missing" });
        setDeleteStage("return");
        break;
      case "failed":
        setDeleteError("Vuelve a pulsar Eliminar clínica para reintentar.");
        break;
    }
  }

  return (
    <>
      <FormPanel
        presentation="modal"
        open={deleteStage !== "confirm"}
        title={clinic ? "Editar clínica" : "Nueva clínica"}
        description={
          clinic
            ? "Actualiza el nombre, el porcentaje por defecto o el estado del centro."
            : "Añade el nombre y el porcentaje por defecto del centro."
        }
        initialFocusRef={
          deleteStage === "return"
            ? deleteBlocked
              ? linkedActivityMessage
              : deleteButton
            : nameInput
        }
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
        {clinic && deletion && (
          <div className="mt-6 space-y-2">
            {deleteBlocked ? (
              <p
                ref={linkedActivityMessage}
                tabIndex={-1}
                className="rounded-lg bg-surface-container-low p-3 text-sm leading-6 text-on-surface"
              >
                Esta clínica tiene actividad registrada y no se puede eliminar.
                Puedes desactivarla para dejar de registrar actividad y
                conservar su historial.
              </p>
            ) : (
              <Button
                ref={deleteButton}
                variant="destructive"
                disabled={result?.status === "missing"}
                aria-haspopup="dialog"
                onClick={() => {
                  if (saving.current) return;
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
          description="Esta acción es permanente. Si la clínica tiene actividad registrada, puedes desactivarla para conservar su historial."
          destructive
          confirmLabel="Eliminar clínica"
          pendingLabel="Eliminando…"
          error={deleteError}
          onOpenChange={() => setDeleteStage("return")}
          onConfirm={handleDelete}
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
