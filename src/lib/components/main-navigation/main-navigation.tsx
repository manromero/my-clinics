import Link from "next/link";
import type { ComponentPropsWithRef } from "react";

const destinations = [
  { href: "/activity", label: "Actividad" },
  { href: "/summary", label: "Resumen" },
  { href: "/clinics", label: "Clínicas" },
  { href: "/settings", label: "Ajustes" },
] as const;

export type MainDestination = (typeof destinations)[number]["href"];

export type MainNavigationProps = Omit<
  ComponentPropsWithRef<"nav">,
  "children"
> & {
  currentHref?: MainDestination;
  labels?: Partial<Record<MainDestination, string>>;
};

export function MainNavigation({
  currentHref,
  labels,
  "aria-label": ariaLabel = "Navegación principal",
  className = "",
  ...props
}: MainNavigationProps) {
  return (
    <nav
      {...props}
      aria-label={ariaLabel}
      className={`max-w-full ${className}`}
    >
      <ul className="flex w-fit max-w-full flex-wrap gap-1.5 rounded-xl bg-surface-container-low p-2">
        {destinations.map(({ href, label }) => (
          <li key={href} className="min-w-0 max-w-full flex-auto">
            <Link
              href={href}
              aria-current={currentHref === href ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center rounded-lg px-3.5 py-2 font-label text-label transition-colors duration-(--duration-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [overflow-wrap:anywhere] ${currentHref === href ? "bg-surface-container font-semibold text-primary" : "font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"}`}
            >
              {labels?.[href] ?? label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
