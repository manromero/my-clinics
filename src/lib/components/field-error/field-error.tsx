import type { ComponentProps } from "react";

export type FieldErrorProps = ComponentProps<"p">;

export function FieldError({ className = "", ...props }: FieldErrorProps) {
  return (
    <p
      {...props}
      className={`text-sm font-medium leading-6 text-error wrap-anywhere ${className}`}
    />
  );
}
