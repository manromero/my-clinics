import type { ComponentPropsWithRef, ReactNode } from "react";

export type BadgeVariant =
  "neutral" | "active" | "inactive" | "informational" | "negative";

export type BadgeProps = Omit<ComponentPropsWithRef<"span">, "children"> & {
  children: string;
  variant?: BadgeVariant;
} & ({ dot?: boolean; icon?: never } | { dot?: never; icon?: ReactNode });

const variants = {
  neutral: "bg-surface-container text-on-surface",
  active: "bg-success-container text-success",
  inactive: "bg-surface-container-high text-on-surface-variant",
  informational: "bg-tertiary-container text-on-tertiary-container",
  negative: "bg-error-container text-on-error-container",
};

/** Compact text label with optional decoration. */
export function Badge({
  children,
  variant = "neutral",
  dot = false,
  icon,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 align-middle font-label text-caption font-medium ${variants[variant]} ${className}`}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      ) : icon ? (
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 [&>svg]:size-3.5"
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
    </span>
  );
}
