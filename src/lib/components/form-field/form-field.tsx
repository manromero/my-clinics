"use client";

import { useId, type ReactNode } from "react";

export type FormFieldControlProps = {
  id: string;
  required: boolean;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
};

export type FormFieldProps = {
  label: string;
  id?: string;
  required?: boolean;
  help?: string;
  error?: string;
  describedBy?: string;
  children: (controlProps: FormFieldControlProps) => ReactNode;
};

export function FormField({
  label,
  id,
  required = false,
  help,
  error,
  describedBy,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const description =
    [
      describedBy,
      help ? `${controlId}-help` : undefined,
      error ? `${controlId}-error` : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="min-w-0 space-y-2 wrap-anywhere">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-label text-label">
        <label htmlFor={controlId} className="font-semibold">
          {label}
        </label>
        <span className="text-caption text-on-surface-variant">
          {required ? "Obligatorio" : "Opcional"}
        </span>
      </div>
      {children({
        id: controlId,
        required,
        "aria-invalid": Boolean(error),
        "aria-describedby": description,
      })}
      {help && (
        <p
          id={`${controlId}-help`}
          className="text-sm leading-6 text-on-surface-variant"
        >
          {help}
        </p>
      )}
      {error && (
        <p
          id={`${controlId}-error`}
          className="text-sm font-medium leading-6 text-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}
