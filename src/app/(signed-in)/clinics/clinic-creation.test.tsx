import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClinicCreation } from "./clinic-creation";
import { createClinic } from "./create-clinic";

vi.mock("./create-clinic", () => ({ createClinic: vi.fn() }));

beforeEach(() => {
  vi.mocked(createClinic).mockReset();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});

async function openForm() {
  const user = userEvent.setup();
  render(<ClinicCreation />);
  await user.click(screen.getByRole("button", { name: "Nueva clínica" }));
  return {
    user,
    name: screen.getByRole<HTMLInputElement>("textbox", {
      name: "Nombre de la clínica",
    }),
    percentage: screen.getByRole("textbox", { name: "Porcentaje por defecto" }),
  };
}

describe("Clinic creation form", () => {
  it("counts code points and caps a paste while preserving text outside the selection", async () => {
    const { user, name } = await openForm();
    expect(name).toHaveAccessibleDescription("0/200 caracteres");
    expect(name).toHaveFocus();
    await user.paste("🦷".repeat(201));
    expect(name).toHaveValue("🦷".repeat(200));
    expect(name).toHaveAccessibleDescription("200/200 caracteres");

    name.setSelectionRange(100, 102);
    await user.paste("XYZ");
    expect(name).toHaveValue("🦷".repeat(50) + "X" + "🦷".repeat(149));
    expect(name.selectionStart).toBe(101);
    expect(name).toHaveAccessibleDescription("200/200 caracteres");
  });

  it("clears only the edited field error and keeps the user's focus", async () => {
    vi.mocked(createClinic).mockResolvedValue({
      status: "invalid",
      nameError: "Introduce el nombre de la clínica.",
      percentageError: "Introduce el porcentaje por defecto.",
    });
    const { user, name, percentage } = await openForm();
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(
      await screen.findByText("Introduce el nombre de la clínica."),
    ).toBeVisible();
    expect(name).toHaveFocus();

    await user.type(name, "Clínica");
    expect(name).not.toHaveAttribute("aria-invalid");
    expect(percentage).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveFocus();

    await user.type(percentage, "25");
    expect(percentage).not.toHaveAttribute("aria-invalid");
    expect(percentage).toHaveFocus();
  });
});
