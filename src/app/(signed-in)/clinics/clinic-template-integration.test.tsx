import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ClinicForm } from "./clinic-form";
import { saveClinicTemplate, cancelTemplateAttempt } from "./template-save";

vi.mock("./template-save", () => ({
  saveClinicTemplate: vi.fn(),
  cancelTemplateAttempt: vi.fn(),
}));
beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value() {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value() {
      this.removeAttribute("open");
    },
  });
});
afterEach(() => cleanup());
function form() {
  const onSaved = vi.fn(),
    onCancel = vi.fn();
  render(
    <ClinicForm
      templatePersistence
      clinic={{
        id: "1",
        name: "Synthetic",
        percentage: 25,
        active: true,
        revision: "2",
        template: { id: "saved", name: "saved.pdf" },
      }}
      save={vi.fn()}
      onSaved={onSaved}
      onCancel={onCancel}
    />,
  );
  return { onSaved, onCancel };
}
it("reports cleanup failure as saved, keeps scoped retry available, and completes on retry", async () => {
  const user = userEvent.setup();
  vi.mocked(saveClinicTemplate)
    .mockResolvedValueOnce({ status: "saved", cleanupPending: true })
    .mockResolvedValueOnce({ status: "saved", cleanupPending: false });
  const { onSaved } = form();
  await user.click(screen.getByRole("button", { name: "Guardar" }));
  expect(
    await screen.findByText(/La clínica y su plantilla están guardadas/),
  ).toBeVisible();
  expect(screen.queryByText("No se pudo guardar")).not.toBeInTheDocument();
  expect(onSaved).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Guardar" }));
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
});
it("retains failed Save values and shows the actionable server error", async () => {
  const user = userEvent.setup();
  vi.mocked(saveClinicTemplate).mockResolvedValue({
    status: "failed",
    message: "Otra sesión ha cambiado esta clínica.",
  });
  const { onSaved } = form();
  const name = screen.getByRole("textbox", { name: /Nombre de la clínica/ });
  await user.clear(name);
  await user.type(name, "Retained retry");
  await user.click(screen.getByRole("button", { name: "Guardar" }));
  expect(
    await screen.findByText("Otra sesión ha cambiado esta clínica."),
  ).toBeVisible();
  expect(name).toHaveValue("Retained retry");
  expect(onSaved).not.toHaveBeenCalled();
});
it("resolves Cancel after an uncertain successful Save as saved", async () => {
  const user = userEvent.setup();
  vi.mocked(cancelTemplateAttempt).mockResolvedValue({
    status: "saved",
    cleanupPending: false,
  });
  const { onSaved, onCancel } = form();
  await user.click(screen.getByRole("button", { name: "Cancelar" }));
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  expect(onCancel).not.toHaveBeenCalled();
});
