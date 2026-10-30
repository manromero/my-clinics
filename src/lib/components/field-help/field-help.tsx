import type { ComponentProps } from "react";

export type FieldHelpProps = ComponentProps<"p">;

export function FieldHelp({ className = "", ...props }: FieldHelpProps) {
  return (
    <p
      {...props}
      className={`text-sm leading-6 text-on-surface-variant wrap-anywhere ${className}`}
    />
  );
}
