"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { FieldLabel } from "../field-label/field-label";
import { FieldRequirement } from "../field-requirement/field-requirement";
import { FieldHelp } from "../field-help/field-help";
import { FieldError } from "../field-error/field-error";

export type TextInputProps = Omit<
  ComponentProps<"input">,
  "type" | "children" | "aria-invalid"
> & {
  label: string;
  help?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  leadingAdornment?: ReactNode;
  trailingAdornment?: ReactNode;
};

export function TextInput({
  label,
  help,
  error,
  invalid = false,
  leadingAdornment,
  trailingAdornment,
  id,
  required = false,
  disabled,
  readOnly,
  className = "",
  "aria-describedby": describedBy,
  ...props
}: TextInputProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hasHelp =
    help !== undefined && help !== null && help !== false && help !== "";
  const hasError =
    error !== undefined && error !== null && error !== false && error !== "";
  const isInvalid = invalid || hasError;
  const description =
    [
      ...new Set([
        ...(describedBy?.split(/\s+/).filter(Boolean) ?? []),
        ...(hasHelp ? [`${controlId}-help`] : []),
        ...(hasError ? [`${controlId}-error`] : []),
      ]),
    ].join(" ") || undefined;

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
        <FieldRequirement required={required} />
      </div>
      <div
        className={`flex min-h-11 min-w-0 items-center gap-2 rounded-lg border px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${isInvalid ? "border-error" : "border-outline-variant/15"} ${disabled ? "bg-surface-container-high text-on-surface-variant" : readOnly ? "bg-surface-container-low" : "bg-surface-container-lowest"}`}
      >
        {leadingAdornment != null && (
          <span
            aria-hidden="true"
            inert
            className="pointer-events-none flex max-w-1/4 shrink-0 items-center overflow-hidden text-on-surface-variant [&_svg]:size-5"
          >
            {leadingAdornment}
          </span>
        )}
        <input
          {...props}
          id={controlId}
          type="text"
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={isInvalid || undefined}
          aria-describedby={description}
          className={`min-h-11 w-full min-w-0 bg-transparent py-2 text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none disabled:cursor-not-allowed disabled:text-on-surface-variant ${className}`}
        />
        {trailingAdornment != null && (
          <span
            aria-hidden="true"
            inert
            className="pointer-events-none flex max-w-1/4 shrink-0 items-center overflow-hidden text-on-surface-variant [&_svg]:size-5"
          >
            {trailingAdornment}
          </span>
        )}
      </div>
      {hasHelp && <FieldHelp id={`${controlId}-help`}>{help}</FieldHelp>}
      {hasError && <FieldError id={`${controlId}-error`}>{error}</FieldError>}
    </div>
  );
}
