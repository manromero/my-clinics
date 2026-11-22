"use client";

import { useId } from "react";

export type SegmentedControlOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SegmentedControlProps = {
  label: string;
  options: readonly SegmentedControlOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

export function SegmentedControl({
  label,
  options,
  name,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
}: SegmentedControlProps) {
  const id = useId();

  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      disabled={disabled}
      className="min-w-0"
    >
      <legend
        id={`${id}-label`}
        className="mb-2 font-label text-label font-semibold"
      >
        {label}
      </legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-surface-container-low p-1.5">
        {options.map((option) => (
          <label key={option.value} className="relative min-w-0">
            <input
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={value === undefined ? undefined : value === option.value}
              defaultChecked={
                value === undefined ? defaultValue === option.value : undefined
              }
              disabled={option.disabled}
              onChange={() => onValueChange?.(option.value)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-center font-label text-label break-words text-on-surface-variant peer-enabled:cursor-pointer peer-enabled:hover:text-on-surface peer-checked:bg-surface-container-lowest peer-checked:font-semibold peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-disabled:cursor-not-allowed peer-disabled:text-on-surface-variant peer-disabled:opacity-60">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
