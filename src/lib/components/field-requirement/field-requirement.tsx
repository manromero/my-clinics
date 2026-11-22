import type { ComponentProps } from "react";

export type FieldRequirementProps = Omit<ComponentProps<"span">, "children"> & {
  required?: boolean;
};

export function FieldRequirement({
  required = false,
  className = "",
  ...props
}: FieldRequirementProps) {
  return (
    <span
      {...props}
      className={`font-label text-caption text-on-surface-variant ${className}`}
    >
      {required ? "Obligatorio" : "Opcional"}
    </span>
  );
}
