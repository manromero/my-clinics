import type { HTMLAttributes, ReactNode } from "react";

export type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "aside";
  variant?: "white" | "tonal" | "highlighted";
  header?: ReactNode;
  actions?: ReactNode;
};

const variants = {
  white: "bg-surface-container-lowest text-on-surface",
  tonal: "bg-surface-container-low text-on-surface",
  highlighted:
    "bg-linear-to-br from-primary to-primary-container text-on-primary [--color-focus:var(--color-on-primary)]",
};

/** A semantic container with optional header and actions around its content. */
export function Surface({
  as: Element = "div",
  variant = "white",
  header,
  actions,
  children,
  className = "",
  ...props
}: SurfaceProps) {
  return (
    <Element
      {...props}
      className={`flex min-w-0 flex-col gap-6 rounded-2xl p-5 [overflow-wrap:anywhere] sm:p-8 ${variants[variant]} ${className}`}
    >
      {header != null && <div className="min-w-0">{header}</div>}
      {children != null && <div className="min-w-0">{children}</div>}
      {actions != null && (
        <div className="mt-auto flex min-w-0 flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </Element>
  );
}
