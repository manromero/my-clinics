import { useEffect, useRef, useState } from "react";
import {
  FileInput,
  type FileInputValue,
} from "@/lib/components/file-input/file-input";
import { templateByteLimit } from "@/lib/templates/pdf-contract";
import type { LocalPdfValidation } from "@/lib/templates/pdf-inspection";
import { Button } from "@/lib/components/button/button";

export type StoredTemplate = { id: string; name: string };
export type TemplateIntent =
  { kind: "keep" } | { kind: "remove" } | { kind: "replace"; file: File };
export type TemplateDraft = {
  intent: TemplateIntent;
  pending: boolean;
  error?: string;
};
export const initialTemplateDraft: TemplateDraft = {
  intent: { kind: "keep" },
  pending: false,
};

function rejection(result: Exclude<LocalPdfValidation, { valid: true }>) {
  switch (result.reason) {
    case "too-large":
      return "El PDF supera el máximo de 10.000.000 bytes (10 MB).";
    case "encrypted":
      return "El PDF está cifrado o protegido con contraseña. Usa un PDF sin protección.";
    case "missing-fields":
      return `Faltan campos de texto: ${result.fields?.join(", ")}.`;
    case "wrong-field-type":
      return `Estos campos deben ser de texto: ${result.fields?.join(", ")}.`;
    case "unreadable":
      return "No se puede leer este PDF rellenable. Selecciona otro archivo o vuelve a intentarlo.";
  }
}

export function ClinicTemplateField({
  stored,
  enabled = false,
  draft,
  onChange,
  validate = async (file) => {
    const { inspectTemplatePdf } =
      await import("@/lib/templates/pdf-inspection");
    return inspectTemplatePdf(new Uint8Array(await file.arrayBuffer()));
  },
}: {
  stored?: StoredTemplate;
  enabled?: boolean;
  draft: TemplateDraft;
  onChange: (draft: TemplateDraft) => void;
  validate?: (file: File) => Promise<LocalPdfValidation>;
}) {
  const revision = useRef(0);
  const field = useRef<HTMLDivElement>(null);
  const [candidate, setCandidate] = useState<File>();
  useEffect(
    () => () => {
      revision.current += 1;
    },
    [],
  );
  const value: FileInputValue = candidate
    ? { kind: "local", file: candidate }
    : draft.intent.kind === "replace"
      ? { kind: "local", file: draft.intent.file }
      : draft.intent.kind === "keep" && stored
        ? { kind: "persisted", name: stored.name }
        : null;
  async function select(value: FileInputValue) {
    const current = ++revision.current;
    setCandidate(undefined);
    if (!value) {
      onChange({
        intent: stored ? { kind: "remove" } : { kind: "keep" },
        pending: false,
      });
      return;
    }
    if (value.kind !== "local") return;
    const file = value.file;
    setCandidate(file);
    onChange({ ...draft, pending: true, error: undefined });
    let result: LocalPdfValidation;
    try {
      result = await validate(file);
    } catch {
      result = { valid: false, reason: "unreadable" };
    }
    if (revision.current !== current) return;
    setCandidate(undefined);
    onChange(
      result.valid
        ? { intent: { kind: "replace", file }, pending: false }
        : { ...draft, pending: false, error: rejection(result) },
    );
  }
  return (
    <div
      ref={field}
      className="space-y-2"
      aria-busy={draft.pending || undefined}
    >
      <FileInput
        label="Plantilla de factura (PDF)"
        value={value}
        onChange={select}
        accept=".pdf"
        maxBytes={templateByteLimit}
        disabled={!enabled}
        error={draft.error}
        help={
          enabled
            ? "PDF rellenable sin contraseña, máximo 10 MB (10.000.000 bytes). La selección se valida en este dispositivo; no se sube ningún archivo."
            : "La asignación de plantillas todavía no está disponible. Puedes guardar los demás datos de la clínica."
        }
      />
      {enabled && draft.error && !value && (
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => {
            revision.current += 1;
            setCandidate(undefined);
            onChange({ ...draft, pending: false, error: undefined });
            field.current?.querySelector("input")?.focus();
          }}
        >
          Descartar archivo rechazado
        </Button>
      )}
      {enabled && (
        <p role="status" className="text-sm leading-6 text-on-surface-variant">
          {draft.pending
            ? "Validando PDF… Puedes seleccionar otro archivo o quitarlo."
            : draft.intent.kind === "remove"
              ? "Eliminación pendiente de Guardar. La plantilla guardada se conserva hasta entonces."
              : draft.intent.kind === "replace"
                ? "Plantilla validada. Cambio pendiente de Guardar."
                : "Sin cambios en la plantilla."}
        </p>
      )}
    </div>
  );
}
