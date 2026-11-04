import Link from "next/link";
import { useId } from "react";

export type BrandProps = {
  variant?: "full" | "compact";
  description?: boolean;
  href?: string;
};

/** MyClinics identity with an optional destination supplied by its consumer. */
export function Brand({
  variant = "full",
  description = false,
  href,
}: BrandProps) {
  const descriptionId = useId();
  const subtitle = description
    ? "Gestión de clínicas y actividad dental"
    : undefined;
  const identity = (
    <>
      {subtitle && variant === "compact" && (
        <span id={descriptionId} hidden>
          {subtitle}
        </span>
      )}
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-container text-on-primary"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[22px]"
          focusable="false"
        >
          <path d="M12 5C9 3 5 3 4 6c-1 3 1 5 1 9 0 3 1 5 3 5 2 0 1-7 4-7s2 7 4 7c2 0 3-2 3-5 0-4 2-6 1-9-1-3-5-3-8-1Z" />
        </svg>
      </span>
      {variant === "full" && (
        <span aria-hidden="true" className="min-w-0">
          <span className="block font-headline text-lg leading-tight font-bold tracking-tight text-on-surface">
            MyClinics
          </span>
          {subtitle && (
            <span
              id={descriptionId}
              className="mt-1 block font-label text-[11px] leading-normal font-medium text-on-surface-variant"
            >
              {subtitle}
            </span>
          )}
        </span>
      )}
    </>
  );
  const className =
    "inline-flex min-h-11 max-w-full items-center gap-3 rounded-xl align-middle";
  return href !== undefined ? (
    <Link
      href={href}
      aria-label="MyClinics"
      aria-describedby={subtitle ? descriptionId : undefined}
      className={`${className} transition-[filter] duration-(--duration-fast) hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
    >
      {identity}
    </Link>
  ) : (
    <span
      role="img"
      aria-label="MyClinics"
      aria-describedby={subtitle ? descriptionId : undefined}
      className={className}
    >
      {identity}
    </span>
  );
}
