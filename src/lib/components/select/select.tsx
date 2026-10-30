"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { FieldLabel } from "../field-label/field-label";
import { FieldRequirement } from "../field-requirement/field-requirement";
import { FieldHelp } from "../field-help/field-help";
import { FieldError } from "../field-error/field-error";

export type SelectOption = { value: string; label: string; disabled?: boolean };
export type SelectGroup = {
  label: string;
  options: readonly SelectOption[];
  disabled?: boolean;
};
export type SelectProps = Omit<
  ComponentProps<"select">,
  "children" | "multiple" | "size" | "aria-invalid" | "value" | "defaultValue"
> & {
  label: string;
  options: readonly (SelectOption | SelectGroup)[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  help?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
};

export function Select({
  label,
  options,
  placeholder,
  value,
  defaultValue,
  help,
  error,
  invalid = false,
  id,
  required = false,
  disabled,
  className = "",
  "aria-describedby": describedBy,
  ...props
}: SelectProps) {
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
  const renderOption = (option: SelectOption) => (
    <option key={option.value} value={option.value} disabled={option.disabled}>
      {option.label}
    </option>
  );

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
        <FieldRequirement required={required} />
      </div>
      <select
        {...props}
        id={controlId}
        required={required}
        disabled={disabled}
        value={value}
        defaultValue={
          value !== undefined
            ? undefined
            : (defaultValue ?? (placeholder !== undefined ? "" : undefined))
        }
        aria-invalid={isInvalid || undefined}
        aria-describedby={description}
        className={`min-h-11 w-full min-w-0 rounded-lg border px-3 py-2 text-base text-on-surface focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:cursor-not-allowed disabled:text-on-surface-variant ${isInvalid ? "border-error" : "border-outline-variant/15"} ${disabled ? "bg-surface-container-high" : "bg-surface-container-lowest"} ${className}`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((item) =>
          "options" in item ? (
            <optgroup
              key={item.label}
              label={item.label}
              disabled={item.disabled}
            >
              {item.options.map(renderOption)}
            </optgroup>
          ) : (
            renderOption(item)
          ),
        )}
      </select>
      {hasHelp && <FieldHelp id={`${controlId}-help`}>{help}</FieldHelp>}
      {hasError && <FieldError id={`${controlId}-error`}>{error}</FieldError>}
    </div>
  );
}
