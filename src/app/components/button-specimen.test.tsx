import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ComponentsPage from "./button/page";

describe("Button catalogue", () => {
  it("registers each variant and size and completes a pending operation", async () => {
    const user = userEvent.setup();
    render(<ComponentsPage />);
    const controls = screen.getByRole("region", {
      name: "Controles y contenedores",
    });
    for (const label of [
      "Acción principal",
      "Acción secundaria",
      "Ver detalles",
      "Eliminar ejemplo",
      "Pequeño",
      "Mediano",
      "Grande",
    ]) {
      await user.click(within(controls).getByRole("button", { name: label }));
    }
    expect(within(controls).getAllByRole("status")[0]).toHaveTextContent(
      "Acciones activadas: 7.",
    );
    const operation = within(controls).getByRole("button", {
      name: "Probar operación",
    });
    const complete = within(controls).getByRole("button", {
      name: "Completar simulación",
    });
    expect(complete).toBeDisabled();
    operation.focus();
    await user.keyboard("{Enter}");
    expect(operation).toBeDisabled();
    expect(operation).toHaveAttribute("aria-busy", "true");
    expect(complete).toBeEnabled();
    await user.click(operation);
    expect(within(controls).getAllByRole("status")[1]).toHaveTextContent(
      "Operación en curso",
    );
    await user.click(complete);
    expect(operation).toBeEnabled();
    expect(complete).toBeDisabled();
    expect(within(controls).getAllByRole("status")[1]).toHaveTextContent(
      "Simulación completada",
    );
  });
});
