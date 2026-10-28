import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ComponentsPage from "./page";
import { Catalogue } from "./catalogue";

describe("components catalogue", () => {
  it("opens with a single page heading and an honest empty state", () => {
    render(<ComponentsPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Catálogo de componentes",
    );
    expect(
      screen.getByRole("heading", { name: "El catálogo está vacío" }),
    ).toBeVisible();
    expect(screen.getAllByText("Sin ejemplos todavía.")).toHaveLength(3);
  });

  it("provides keyboard-operable links to labelled section destinations", async () => {
    const user = userEvent.setup();
    render(<ComponentsPage />);
    await user.tab();
    expect(screen.getByRole("link", { name: "Ir al catálogo" })).toHaveFocus();
    const navigation = screen.getByRole("navigation", {
      name: "Secciones del catálogo",
    });
    for (const title of [
      "Fundamentos visuales",
      "Controles y contenedores",
      "Estructura de pantalla",
    ]) {
      await user.tab();
      const link = within(navigation).getByRole("link", { name: title });
      expect(link).toHaveFocus();
      const destination = document.querySelector(link.getAttribute("href")!);
      expect(destination).toBe(
        screen.getByRole("heading", { level: 2, name: title }),
      );
      expect(destination).toHaveAttribute("tabindex", "-1");
      expect(screen.getByRole("region", { name: title })).toContainElement(
        destination as HTMLElement,
      );
      await user.keyboard("{Enter}");
    }
  });

  it("renders registered synthetic examples with their own interactive state", async () => {
    const user = userEvent.setup();
    render(
      <Catalogue
        sections={[
          {
            id: "prueba",
            title: "Ejemplos de prueba",
            description: "Datos sintéticos.",
            examples: [
              {
                id: "opcion",
                title: "Selección",
                content: (
                  <label>
                    <input type="checkbox" /> Opción de ejemplo
                  </label>
                ),
              },
            ],
          },
        ]}
      />,
    );
    expect(
      screen.queryByText("El catálogo está vacío"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Selección" }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("checkbox", { name: "Opción de ejemplo" }),
    );
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});
