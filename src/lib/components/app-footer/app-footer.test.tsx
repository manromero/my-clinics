import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppFooter } from "./app-footer";

describe("AppFooter", () => {
  it("renders an application footer with only the supplied identity", () => {
    render(<AppFooter identity="MyClinics · Espacio de demostración" />);

    const footer = screen.getByRole("contentinfo");
    expect(footer.tagName).toBe("FOOTER");
    expect(footer).toHaveTextContent(/^MyClinics · Espacio de demostración$/);
    expect(within(footer).queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("shows caller metadata without adding an empty navigation landmark", () => {
    render(
      <AppFooter
        identity="MyClinics"
        metadata="Edición de pruebas"
        navigation={{ label: "Recursos", links: [] }}
      />,
    );

    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByText("Edición de pruebas")).toBeVisible();
    expect(within(footer).queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("preserves caller destinations and exposes the links in keyboard order", async () => {
    const user = userEvent.setup();
    render(
      <AppFooter
        identity="MyClinics"
        metadata="Edición de pruebas"
        navigation={{
          label: "Recursos del pie de página",
          links: [
            { label: "Guía de ejemplo", href: "/guia?idioma=es#inicio" },
            { label: "Referencia externa", href: "https://example.test/ayuda" },
          ],
        }}
      />,
    );

    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByText("MyClinics")).toBeVisible();
    expect(within(footer).getByText("Edición de pruebas")).toBeVisible();
    const nav = within(footer).getByRole("navigation", {
      name: "Recursos del pie de página",
    });
    const firstLink = within(nav).getByRole("link", {
      name: "Guía de ejemplo",
    });
    const secondLink = within(nav).getByRole("link", {
      name: "Referencia externa",
    });

    expect(firstLink).toHaveAttribute("href", "/guia?idioma=es#inicio");
    expect(secondLink).toHaveAttribute("href", "https://example.test/ayuda");
    await user.tab();
    expect(firstLink).toHaveFocus();
    await user.tab();
    expect(secondLink).toHaveFocus();
  });
});
