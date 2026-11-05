import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PageHeader } from "./page-header";
import { Button } from "../button/button";
import { ActionLink } from "../action-link/action-link";
import { Badge } from "../badge/badge";

describe("PageHeader", () => {
  it("renders a page heading without inventing optional content", () => {
    const { container } = render(
      <main>
        <PageHeader title="Gestión de clínicas" />
      </main>,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Gestión de clínicas" }),
    ).toBeVisible();
    expect(container.querySelector("header")?.textContent).toBe(
      "Gestión de clínicas",
    );
  });
  it.each([1, 2, 3, 4, 5, 6] as const)(
    "preserves heading level %s and caller naming",
    (headingLevel) => {
      render(
        <section aria-labelledby="heading">
          <PageHeader
            title="Resumen mensual"
            titleId="heading"
            headingLevel={headingLevel}
          />
        </section>,
      );
      expect(
        within(
          screen.getByRole("region", { name: "Resumen mensual" }),
        ).getByRole("heading", { level: headingLevel }),
      ).toHaveAttribute("id", "heading");
    },
  );
  it("composes optional rich content without changing its semantics", () => {
    render(
      <PageHeader
        title="Clínicas"
        eyebrow="Configuración"
        description={<p>Datos de ejemplo</p>}
        metadata={<Badge variant="informational">Ejercicio 2026</Badge>}
        actions={<ActionLink href="/components">Ver catálogo</ActionLink>}
        aria-label="Cabecera de ejemplo"
      />,
    );
    expect(screen.getByText("Configuración")).toBeVisible();
    expect(screen.getByText("Datos de ejemplo").tagName).toBe("P");
    expect(screen.getByText("Ejercicio 2026")).toBeVisible();
    expect(screen.getByRole("link", { name: "Ver catálogo" })).toHaveAttribute(
      "href",
      "/components",
    );
    expect(screen.getByLabelText("Cabecera de ejemplo").tagName).toBe("HEADER");
  });
  it("leaves action and filter keyboard behavior with the composed controls", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onChange = vi.fn();
    render(
      <PageHeader
        title="Actividad"
        actions={<Button onClick={onClick}>Actualizar</Button>}
        filters={
          <label>
            Periodo
            <select defaultValue="oct" onChange={onChange}>
              <option value="oct">Octubre</option>
              <option value="nov">Noviembre</option>
            </select>
          </label>
        }
      />,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Actualizar" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
    await user.tab();
    expect(screen.getByRole("combobox", { name: "Periodo" })).toHaveFocus();
    await user.selectOptions(screen.getByRole("combobox"), "nov");
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByRole("combobox")).toHaveValue("nov");
  });
});
