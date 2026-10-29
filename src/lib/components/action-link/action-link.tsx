import Link from "next/link";
import type { ComponentPropsWithRef, ReactNode } from "react";

export type ActionLinkProps = ComponentPropsWithRef<typeof Link> & {
  variant?: "text" | "primary" | "secondary";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

const variants = {
  text: "min-h-11 py-2 text-primary underline underline-offset-4 hover:decoration-2",
  primary:
    "min-h-12 px-5 py-3 bg-linear-to-r from-primary to-primary-container text-on-primary hover:brightness-90",
  secondary:
    "min-h-12 px-5 py-3 bg-surface-container-high text-primary hover:bg-surface-dim",
};

/** Navigation with text or button-like presentation. */
export function ActionLink({
  variant = "text",
  startIcon,
  endIcon,
  className = "",
  children,
  ...props
}: ActionLinkProps) {
  return (
    <Link
      {...props}
      className={`inline-flex max-w-full items-center justify-center gap-2 rounded-lg font-label text-label font-semibold transition-[background-color,filter] duration-(--duration-fast) ease-standard focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${variants[variant]} ${className}`}
    >
      {startIcon && (
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 [&>svg]:size-4"
        >
          {startIcon}
        </span>
      )}
      <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
      {endIcon && (
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 [&>svg]:size-4"
        >
          {endIcon}
        </span>
      )}
    </Link>
  );
}
