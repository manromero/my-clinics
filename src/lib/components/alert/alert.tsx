import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { Button } from "../button/button";

export type AlertProps = Omit<
  ComponentPropsWithRef<"div">,
  | "title"
  | "children"
  | "role"
  | "aria-live"
  | "aria-atomic"
  | "aria-labelledby"
> & {
  title: string;
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  announcement?: "off" | "polite" | "assertive";
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    pending?: boolean;
  };
};

const variants = {
  info: "bg-surface-container-low text-on-surface-variant",
  success: "bg-success-container text-success",
  warning: "bg-warning-container text-warning",
  error: "bg-error-container text-on-error-container",
};

/** Static explanation by default; opt into live announcements for operation updates. */
export function Alert({
  title,
  children,
  variant = "info",
  announcement = "off",
  action,
  className = "",
  ...props
}: AlertProps) {
  const titleId = useId();
  return (
    <div
      {...props}
      role="group"
      aria-labelledby={titleId}
      className={`flex min-w-0 items-start gap-3 rounded-lg p-4 sm:p-5 ${variants[variant]} ${className}`}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 size-5 shrink-0"
      >
        {variant === "warning" ? (
          <>
            <path d="m12 3 10 18H2L12 3Z" />
            <path d="M12 9v5m0 3h.01" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="9" />
            {variant === "success" ? (
              <path d="m8 12 3 3 5-6" />
            ) : variant === "error" ? (
              <path d="m9 9 6 6m0-6-6 6" />
            ) : (
              <path d="M12 11v6m0-10h.01" />
            )}
          </>
        )}
      </svg>
      <div className="min-w-0 flex-1 space-y-3 wrap-anywhere">
        <div
          role={
            announcement === "off"
              ? undefined
              : announcement === "polite"
                ? "status"
                : "alert"
          }
          aria-atomic={announcement === "off" ? undefined : true}
        >
          <p id={titleId} className="font-label text-label font-semibold">
            {title}
          </p>
          <div className="mt-1 text-sm leading-6">{children}</div>
        </div>
        {action && (
          <Button
            variant="secondary"
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            pending={action.pending}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
