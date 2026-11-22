"use client";

import { TextInput, type TextInputProps } from "../text-input/text-input";
import {
  parseDecimal,
  type DecimalRestrictions,
  type DecimalResult,
} from "./parse-decimal";

export { parseDecimal } from "./parse-decimal";
export type { DecimalRestrictions, DecimalResult } from "./parse-decimal";

export type DecimalInputProps = Omit<
  TextInputProps,
  | "value"
  | "defaultValue"
  | "onChange"
  | "inputMode"
  | "min"
  | "max"
  | "step"
  | "pattern"
  | "maxLength"
  | "minLength"
  | "leadingAdornment"
  | "trailingAdornment"
> &
  DecimalRestrictions & {
    value: string;
    onValueChange: (raw: string, parsed: DecimalResult) => void;
    adornment?: "€" | "%";
  };

export function DecimalInput({
  value,
  onValueChange,
  allowNegative,
  min,
  max,
  adornment,
  ...props
}: DecimalInputProps) {
  return (
    <TextInput
      {...props}
      value={value}
      inputMode="decimal"
      trailingAdornment={adornment}
      onChange={(event) => {
        const raw = event.currentTarget.value;
        onValueChange(raw, parseDecimal(raw, { allowNegative, min, max }));
      }}
    />
  );
}
