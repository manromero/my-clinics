import type { ComponentPropsWithRef, ReactNode } from "react";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "sm" | "md" | "lg";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  pending?: boolean;
};

const variants = {
  primary:
    "bg-linear-to-r from-primary to-primary-container text-on-primary enabled:hover:brightness-90",
  secondary:
    "bg-surface-container-high text-primary enabled:hover:bg-surface-dim",
  tertiary:
    "text-primary enabled:hover:bg-primary/10 enabled:hover:underline underline-offset-4",
  destructive: "bg-error text-on-primary enabled:hover:brightness-90",
};
const sizes = {
  sm: "min-h-11 px-3 py-2 text-caption",
  md: "min-h-12 px-5 py-3 text-label",
  lg: "min-h-14 px-6 py-4 text-body",
};

/**
 * A labelled native action; see /components/button for interactive examples.
 * Defaults to type="button"; use type="submit" explicitly for form submission.
 * Pending disables activation and sets aria-busy. The caller owns operation state
 * and supplies nearby live progress, success or failure feedback.
 * Disabled/pending buttons are omitted from sequential keyboard focus.
 * Icons must be decorative and noninteractive; keep visible text in children.
 * Use IconButton for icon-only actions. Do not nest links or controls in slots.
 * Interactive consumers need a Client Component. className supports composition;
 * preserve contrast, target size and focus styling when overriding styles.
 */
export function Button({
  variant = "primary",
  size = "md",
  startIcon,
  endIcon,
  pending = false,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || props["aria-busy"]}
      className={`inline-flex max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg font-label font-semibold transition-[background-color,filter] duration-(--duration-fast) ease-standard disabled:cursor-default disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {pending ? (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" opacity=".3" />
          <path d="M12 3a9 9 0 0 1 9 9" />
        </svg>
      ) : startIcon ? (
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 [&>svg]:size-4"
        >
          {startIcon}
        </span>
      ) : null}
      <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
      {endIcon && (
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 [&>svg]:size-4"
        >
          {endIcon}
        </span>
      )}
    </button>
  );
}
