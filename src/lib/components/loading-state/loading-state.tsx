import type { ComponentPropsWithRef } from "react";

export type LoadingStateProps = Omit<
  ComponentPropsWithRef<"div">,
  "children" | "role" | "aria-live" | "aria-atomic" | "aria-busy"
> & {
  label: string;
  variant?: "compact" | "region";
  indicator?: "spinner" | "skeleton" | "none";
};

/** Keep outside the busy region; associate its id with that region's aria-describedby. */
export function LoadingState({
  label,
  variant = "compact",
  indicator = "spinner",
  className = "",
  ...props
}: LoadingStateProps) {
  return (
    <div
      {...props}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`flex min-w-0 gap-3 text-on-surface-variant ${variant === "region" ? "flex-col items-center rounded-lg bg-surface-container-low px-6 py-8 text-center" : "items-center"} ${className}`}
    >
      {indicator === "spinner" && (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          fill="none"
          className="size-5 shrink-0 motion-safe:animate-spin motion-reduce:animate-none"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.2"
          />
          <path
            d="M12 3a9 9 0 0 1 9 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {indicator === "skeleton" && (
        <div
          aria-hidden="true"
          className="flex w-full max-w-xs flex-col gap-2 motion-safe:animate-pulse motion-reduce:animate-none"
        >
          <span className="h-3 w-full rounded-sm bg-surface-container-highest" />
          <span className="h-3 w-2/3 rounded-sm bg-surface-container-highest" />
        </div>
      )}
      <p className="min-w-0 font-label text-label leading-6 wrap-anywhere">
        {label}
      </p>
    </div>
  );
}
