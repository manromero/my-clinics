import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Surface } from "./surface";

describe("Surface", () => {
  it.each(["white", "tonal", "highlighted"] as const)(
    "composes caller content and accessible actions in the %s variant",
    async (variant) => {
      const user = userEvent.setup();
      const activate = vi.fn();
      render(
        <Surface
          as="section"
          variant={variant}
          aria-labelledby="title"
          header={<h2 id="title">Información del ejemplo</h2>}
          actions={<button onClick={activate}>Continuar</button>}
        >
          <p>Contenido que conserva su significado.</p>
          <a href="#details">Consultar detalles</a>
        </Surface>,
      );
      const surface = screen.getByRole("region", {
        name: "Información del ejemplo",
      });
      expect(within(surface).getByRole("heading", { level: 2 })).toBeVisible();
      expect(
        within(surface).getByText("Contenido que conserva su significado."),
      ).toBeVisible();
      await user.tab();
      expect(screen.getByRole("link")).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
      await user.keyboard("{Enter} ");
      expect(activate).toHaveBeenCalledTimes(2);
    },
  );

  it.each([
    ["article", "article"],
    ["aside", "complementary"],
    ["section", "region"],
  ] as const)(
    "preserves caller-selected %s semantics and attributes",
    (as, role) => {
      render(
        <Surface as={as} aria-label="Ejemplo" id="sample">
          Texto
        </Surface>,
      );
      expect(screen.getByRole(role, { name: "Ejemplo" })).toHaveAttribute(
        "id",
        "sample",
      );
      expect(
        screen.getByRole(role, { name: "Ejemplo" }).tagName.toLowerCase(),
      ).toBe(as);
    },
  );

  it("defaults to a neutral, non-interactive div without fabricated landmarks", () => {
    const { container } = render(<Surface>Solo contenido</Surface>);
    expect(container.firstElementChild?.tagName).toBe("DIV");
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Solo contenido")).toBeVisible();
  });

  it("supports header-only and actions-only composition without requiring content", () => {
    render(
      <>
        <Surface header={<h2>Cabecera independiente</h2>} />
        <Surface actions={<a href="#continue">Siguiente</a>} />
      </>,
    );
    expect(
      screen.getByRole("heading", { name: "Cabecera independiente" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Siguiente" })).toHaveAttribute(
      "href",
      "#continue",
    );
  });
});
