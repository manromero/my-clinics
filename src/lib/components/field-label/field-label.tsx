import type { ComponentProps } from "react";

export type FieldLabelProps = ComponentProps<"label">;

export function FieldLabel({ className = "", ...props }: FieldLabelProps) {
  return (
    <label
      {...props}
      className={`font-label text-label font-semibold wrap-anywhere ${className}`}
    />
  );
}
