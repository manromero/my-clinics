import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FormField } from "./form-field";

describe("FormField", () => {
  it("focuses the associated required control from its label and supports keyboard entry", async () => {
    const user = userEvent.setup();
    render(
      <FormField label="Nombre" required help="Escribe un nombre visible.">
        {(props) => <input {...props} />}
      </FormField>,
    );
    const control = screen.getByRole("textbox", { name: "Nombre" });
    expect(control).toBeRequired();
    expect(screen.getByText("Obligatorio")).toBeVisible();
    expect(control).toHaveAccessibleDescription("Escribe un nombre visible.");
    await user.click(screen.getByText("Nombre"));
    expect(control).toHaveFocus();
    await user.keyboard("Ejemplo");
    expect(control).toHaveValue("Ejemplo");
  });

  it("keeps unique generated IDs stable across error changes and removes obsolete descriptions", () => {
    const fields = (error?: string) => (
      <>
        <FormField label="Primero" error={error} help="Ayuda.">
          {(props) => <input {...props} />}
        </FormField>
        <FormField label="Segundo">
          {(props) => <textarea {...props} />}
        </FormField>
      </>
    );
    const { rerender } = render(fields("Revisa el valor."));
    const first = screen.getByRole("textbox", { name: "Primero" });
    const id = first.id;
    expect(first).toBeInvalid();
    expect(first).toHaveAccessibleDescription("Ayuda. Revisa el valor.");
    expect(screen.getByRole("textbox", { name: "Segundo" }).id).not.toBe(id);
    rerender(fields());
    expect(first.id).toBe(id);
    expect(first).toHaveAttribute("aria-invalid", "false");
    expect(first).toHaveAccessibleDescription("Ayuda.");
    expect(screen.queryByText("Revisa el valor.")).not.toBeInTheDocument();
  });

  it("supports a caller ID, external descriptions, error without help and optional native controls", async () => {
    const user = userEvent.setup();
    render(
      <>
        <p id="context">Contexto adicional.</p>
        <FormField
          id="choice"
          label="Preferencia"
          error="Elige una opción."
          describedBy="context"
        >
          {(props) => (
            <select {...props} defaultValue="">
              <option value="">Sin selección</option>
              <option value="a">Opción A</option>
            </select>
          )}
        </FormField>
      </>,
    );
    const control = screen.getByRole("combobox", { name: "Preferencia" });
    expect(control).toHaveAttribute("id", "choice");
    expect(control).not.toBeRequired();
    expect(screen.getByText("Opcional")).toBeVisible();
    expect(control).toBeInvalid();
    expect(control).toHaveAccessibleDescription(
      "Contexto adicional. Elige una opción.",
    );
    await user.tab();
    expect(control).toHaveFocus();
    await user.selectOptions(control, "a");
    expect(control).toHaveValue("a");
    expect(control).toBeInvalid();
  });

  it("omits absent descriptions and leaves blank optional values valid", () => {
    render(
      <FormField label="Descripción">
        {(props) => <textarea {...props} />}
      </FormField>,
    );
    const control = screen.getByRole("textbox", { name: "Descripción" });
    expect(control).not.toHaveAttribute("aria-describedby");
    expect(control).toBeValid();
    expect(control).toHaveValue("");
  });
});
