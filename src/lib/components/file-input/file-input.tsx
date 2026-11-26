"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Button } from "../button/button";
import { FieldLabel } from "../field-label/field-label";
import { FieldRequirement } from "../field-requirement/field-requirement";
import { FieldHelp } from "../field-help/field-help";
import { FieldError } from "../field-error/field-error";

export type FileInputValue =
  { kind: "local"; file: File } | { kind: "persisted"; name: string } | null;

export type FileInputProps = {
  id?: string;
  label: string;
  value: FileInputValue;
  onChange: (value: FileInputValue) => void;
  accept?: string;
  maxBytes?: number;
  required?: boolean;
  disabled?: boolean;
  pending?: boolean;
  help?: ReactNode;
  error?: ReactNode;
};

function matchesType(file: File, accept: string) {
  return accept.split(",").some((specifier) => {
    const type = specifier.trim().toLowerCase();
    if (type.startsWith(".")) return file.name.toLowerCase().endsWith(type);
    if (type.endsWith("/*"))
      return file.type.toLowerCase().startsWith(type.slice(0, -1));
    return file.type.toLowerCase() === type;
  });
}

// The controlled value is authoritative; consumers submit local bytes or saved identity separately.
export function FileInput({
  id,
  label,
  value,
  onChange,
  accept,
  maxBytes,
  required = false,
  disabled = false,
  pending = false,
  help,
  error,
}: FileInputProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [rejection, setRejection] = useState<string>();
  const blocked = disabled || pending;
  const message = rejection || error;
  const filename = value?.kind === "local" ? value.file.name : value?.name;
  const descriptions = [
    `${controlId}-status`,
    ...(help ? [`${controlId}-help`] : []),
    ...(message ? [`${controlId}-error`] : []),
  ].join(" ");

  function select(files: File[]) {
    if (blocked || files.length === 0) return;
    let reason: string | undefined;
    if (files.length !== 1) reason = "Selecciona un solo archivo.";
    else if (accept?.trim() && !matchesType(files[0], accept))
      reason = `Tipo de archivo no permitido. Usa: ${accept}.`;
    else if (maxBytes !== undefined && files[0].size > maxBytes)
      reason = `El archivo supera el máximo de ${maxBytes.toLocaleString("es-ES")} bytes.`;
    setRejection(reason);
    if (!reason) onChange({ kind: "local", file: files[0] });
  }

  return (
    <div className="min-w-0 space-y-2" aria-busy={pending || undefined}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
        <FieldRequirement required={required} />
      </div>
      <div
        className={`min-w-0 space-y-3 rounded-lg border p-4 ${message ? "border-error" : "border-outline-variant/15"} ${blocked ? "bg-surface-container-high text-on-surface-variant" : dragging ? "bg-primary/10 outline-2 outline-primary" : "bg-surface-container-low"}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!blocked && event.dataTransfer.types.includes("Files")) {
            dragDepth.current += 1;
            setDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = blocked ? "none" : "copy";
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          select(Array.from(event.dataTransfer.files));
        }}
      >
        <p
          id={`${controlId}-status`}
          role="status"
          className="text-sm wrap-anywhere"
        >
          {pending
            ? `Procesando archivo…${filename ? ` ${filename}` : ""}`
            : !blocked && dragging
              ? "Suelta el archivo aquí"
              : filename
                ? `${value?.kind === "persisted" ? "Guardado" : "Seleccionado"}: ${filename}`
                : "Arrastra un archivo aquí o selecciónalo desde tu dispositivo."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative rounded-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
            <input
              ref={input}
              id={controlId}
              type="file"
              accept={accept}
              disabled={blocked}
              aria-required={required}
              aria-invalid={!!message || undefined}
              aria-describedby={descriptions}
              className="peer sr-only"
              onChange={(event) => {
                const files = Array.from(event.currentTarget.files ?? []);
                // Reset after every attempt so choosing the same file fires change again.
                event.currentTarget.value = "";
                select(files);
              }}
            />
            <label
              htmlFor={controlId}
              className={`inline-flex min-h-11 items-center rounded-lg bg-surface-container-high px-3 py-2 font-label text-caption font-semibold text-primary ${blocked ? "opacity-60" : "cursor-pointer hover:bg-surface-dim"}`}
            >
              {value ? "Reemplazar archivo" : "Seleccionar archivo"}
            </label>
          </div>
          {value && (
            <Button
              variant="tertiary"
              size="sm"
              disabled={blocked}
              onClick={() => {
                setRejection(undefined);
                onChange(null);
                input.current?.focus();
              }}
            >
              Quitar archivo<span className="sr-only"> de {label}</span>
            </Button>
          )}
        </div>
      </div>
      {help && <FieldHelp id={`${controlId}-help`}>{help}</FieldHelp>}
      {message && (
        <FieldError id={`${controlId}-error`} role="alert">
          {message}
        </FieldError>
      )}
    </div>
  );
}
