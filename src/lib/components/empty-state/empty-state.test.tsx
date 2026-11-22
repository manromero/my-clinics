import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("names and describes an empty region without error or loading announcements", () => {
    render(
      <EmptyState
        title="Sin registros"
        explanation="Añade el primero cuando quieras."
      />,
    );
    const region = screen.getByRole("region", { name: "Sin registros" });
    expect(region).toHaveAccessibleDescription(
      "Añade el primero cuando quieras.",
    );
    expect(
      within(region).getByRole("heading", { level: 2, name: "Sin registros" }),
    ).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(region).not.toHaveAttribute("aria-busy");
  });

  it("activates a callback with Enter and Space without submitting a form", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <EmptyState
          title="Sin resultados"
          explanation="Prueba otra búsqueda."
          action={{ label: "Limpiar filtros", onClick: action }}
        />
      </form>,
    );
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Limpiar filtros" }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(action).toHaveBeenCalledTimes(2);
    expect(submit).not.toHaveBeenCalled();
  });

  it("preserves the consumer's link destination and native keyboard access", async () => {
    render(
      <EmptyState
        title="Sin elementos"
        explanation="Puedes explorar otras opciones."
        action={{ label: "Explorar", href: "/components?view=all#catalogo" }}
      />,
    );
    const link = screen.getByRole("link", { name: "Explorar" });
    expect(link).toHaveAttribute("href", "/components?view=all#catalogo");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    await userEvent.tab();
    expect(link).toHaveFocus();
  });

  it("supports nested heading levels, unique descriptions and decorative icons", () => {
    render(
      <>
        <EmptyState
          title="Primero"
          explanation="Explicación uno."
          headingLevel={4}
          icon={
            <svg role="img" aria-label="Decoración">
              <title>Icono</title>
            </svg>
          }
        />
        <EmptyState title="Segundo" explanation="Explicación dos." />
      </>,
    );
    expect(
      screen.getByRole("heading", { level: 4, name: "Primero" }),
    ).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Primero" }),
    ).toHaveAccessibleDescription("Explicación uno.");
    expect(
      screen.getByRole("region", { name: "Segundo" }),
    ).toHaveAccessibleDescription("Explicación dos.");
  });
});
