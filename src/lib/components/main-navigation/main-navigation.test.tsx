import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MainNavigation } from "./main-navigation";
import type { ComponentProps } from "react";

vi.mock("next/link", () => ({
  default: ({
    prefetch,
    ...props
  }: ComponentProps<"a"> & { prefetch?: boolean }) => (
    <a {...props} data-prefetch={String(prefetch)} />
  ),
}));

const routes = [
  "/clinics",
  "/activity",
  "/summary",
  "/invoices",
  "/settings",
] as const;
const labels = ["Clínicas", "Actividad", "Resumen", "Facturas", "Ajustes"];

describe("MainNavigation", () => {
  it("prefetches only the available alternate destinations at their supplied scope", () => {
    render(
      <MainNavigation
        currentHref="/activity"
        availableDestinations={["/clinics", "/activity", "/summary"]}
        hrefs={{ "/summary": "/summary?year=2026&month=10&clinic=7" }}
        prefetch
      />,
    );
    expect(screen.getByRole("link", { name: "Actividad" })).toHaveAttribute(
      "data-prefetch",
      "false",
    );
    expect(screen.getByRole("link", { name: "Clínicas" })).toHaveAttribute(
      "data-prefetch",
      "true",
    );
    expect(screen.getByRole("link", { name: "Resumen" })).toHaveAttribute(
      "data-prefetch",
      "true",
    );
    expect(screen.getByRole("link", { name: "Resumen" })).toHaveAttribute(
      "href",
      "/summary?year=2026&month=10&clinic=7",
    );
    expect(
      screen.queryByRole("link", { name: "Ajustes" }),
    ).not.toBeInTheDocument();
  });
  it("provides all Spanish destinations in a named navigation landmark", () => {
    render(<MainNavigation />);
    const links = within(
      screen.getByRole("navigation", { name: "Navegación principal" }),
    ).getAllByRole("link");
    expect(links).toHaveLength(5);
    links.forEach((link, index) => {
      expect(link).toHaveAccessibleName(labels[index]);
      expect(link).toHaveAttribute("href", routes[index]);
      expect(link).not.toHaveAttribute("aria-current");
    });
  });

  it.each(routes)("identifies only %s as the current page", (currentHref) => {
    const { rerender } = render(<MainNavigation currentHref={currentHref} />);
    expect(
      screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("aria-current") === "page"),
    ).toEqual([
      screen.getByRole("link", { name: labels[routes.indexOf(currentHref)] }),
    ]);
    rerender(<MainNavigation currentHref="/settings" />);
    expect(screen.getByRole("link", { name: "Ajustes" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Actividad" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("uses supplied scoped URLs while identifying the destination by its route", () => {
    render(
      <MainNavigation
        currentHref="/activity"
        hrefs={{
          "/activity": "/activity?year=2026&month=10",
          "/summary": "/summary?year=2026&month=10&clinic=7",
        }}
      />,
    );
    expect(screen.getByRole("link", { name: "Actividad" })).toHaveAttribute(
      "href",
      "/activity?year=2026&month=10",
    );
    expect(screen.getByRole("link", { name: "Actividad" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Resumen" })).toHaveAttribute(
      "href",
      "/summary?year=2026&month=10&clinic=7",
    );
    expect(screen.getByRole("link", { name: labels[0] })).toHaveAttribute(
      "href",
      "/clinics",
    );
  });

  it("links only to available destinations when given a subset", () => {
    render(
      <MainNavigation
        currentHref="/clinics"
        availableDestinations={["/clinics"]}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("Clínicas");
    expect(links[0]).toHaveAttribute("aria-current", "page");
  });

  it("preserves native sequential and reverse keyboard navigation and Enter activation", async () => {
    const user = userEvent.setup();
    const activate = vi.fn((event) => event.preventDefault());
    render(<MainNavigation currentHref="/summary" onClick={activate} />);
    for (const label of labels) {
      await user.tab();
      expect(screen.getByRole("link", { name: label })).toHaveFocus();
      await user.keyboard("{Enter}");
    }
    expect(activate).toHaveBeenCalledTimes(5);
    await user.tab({ shift: true });
    expect(screen.getByRole("link", { name: "Facturas" })).toHaveFocus();
  });

  it("keeps full long labels accessible without changing destinations", () => {
    const label = "Actividad mensual y registro de honorarios profesionales";
    render(
      <MainNavigation
        aria-label="Explorar aplicación"
        labels={{ "/activity": label }}
        currentHref="/activity"
      />,
    );
    expect(
      screen.getByRole("navigation", { name: "Explorar aplicación" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: label })).toHaveAttribute(
      "href",
      "/activity",
    );
    expect(screen.getByRole("link", { name: label })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: labels[0] })).toBeInTheDocument();
  });
});
