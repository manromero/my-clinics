import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it.each([
    ["neutral", "5 clínicas"],
    ["active", "Activa"],
    ["inactive", "Inactiva"],
    ["informational", "Información disponible"],
    ["negative", "Gasto negativo"],
  ] as const)(
    "preserves an explanatory Spanish label for %s",
    (variant, label) => {
      render(<Badge variant={variant}>{label}</Badge>);
      expect(screen.getByText(label)).toBeVisible();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );

  it("keeps optional decorations out of accessible content", () => {
    const { rerender } = render(<Badge dot>Activa</Badge>);
    expect(
      screen.getByText("Activa").parentElement?.firstElementChild,
    ).toHaveAttribute("aria-hidden", "true");
    rerender(
      <Badge
        icon={
          <svg role="img" aria-label="Información decorativa">
            <title>Información decorativa</title>
          </svg>
        }
      >
        Información disponible
      </Badge>,
    );
    expect(screen.getByText("Información disponible")).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen
        .getByTitle("Información decorativa")
        .closest('[aria-hidden="true"]'),
    ).not.toBeNull();
    rerender(<Badge>Sin decoración</Badge>);
    expect(
      screen
        .getByText("Sin decoración")
        .parentElement?.querySelector('[aria-hidden="true"]'),
    ).toBeNull();
  });

  it("does not add a tab stop between surrounding controls", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Anterior</button>
        <Badge dot>Activa</Badge>
        <button>Siguiente</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Anterior" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Siguiente" })).toHaveFocus();
  });

  it("preserves attributes and updates text when the caller changes the label", () => {
    const { rerender } = render(
      <Badge id="state" title="Estado del ejemplo" lang="es">
        Activa
      </Badge>,
    );
    expect(screen.getByTitle("Estado del ejemplo")).toHaveAttribute(
      "id",
      "state",
    );
    expect(screen.getByTitle("Estado del ejemplo")).toHaveAttribute(
      "lang",
      "es",
    );
    rerender(<Badge variant="inactive">Inactiva</Badge>);
    expect(screen.queryByText("Activa")).not.toBeInTheDocument();
    expect(screen.getByText("Inactiva")).toBeVisible();
  });
});
