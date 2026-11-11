import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MainNavigation } from "./main-navigation";

const routes = ["/activity", "/summary", "/clinics", "/settings"] as const;
const labels = ["Actividad", "Resumen", "Clínicas", "Ajustes"];

describe("MainNavigation", () => {
  it("provides all four Spanish destinations in a named navigation landmark", () => {
    render(<MainNavigation />);
    const links = within(
      screen.getByRole("navigation", { name: "Navegación principal" }),
    ).getAllByRole("link");
    expect(links).toHaveLength(4);
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
    expect(activate).toHaveBeenCalledTimes(4);
    await user.tab({ shift: true });
    expect(screen.getByRole("link", { name: "Clínicas" })).toHaveFocus();
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
    expect(screen.getByRole("link", { name: "Clínicas" })).toBeInTheDocument();
  });
});
