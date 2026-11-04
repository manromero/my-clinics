import { useState } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "./confirm-dialog";

beforeEach(() => {
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
  vi.stubGlobal("PointerEvent", MouseEvent);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});
function Example({
  confirm = () => {},
  pending = false,
}: {
  confirm?: () => void | Promise<void>;
  pending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Eliminar ejemplo"
        description="Revisa este registro."
        destructive
        pending={pending}
        error={error}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          try {
            await confirm();
            setOpen(false);
          } catch {
            setError("No se ha eliminado. Inténtalo de nuevo.");
            throw new Error("Failure");
          }
        }}
      >
        <p>28/10/2026 · Clínica de ejemplo · 240,00 €</p>
      </ConfirmDialog>
    </>
  );
}
describe("ConfirmDialog", () => {
  it("describes the decision, initially focuses Cancel, cancels safely and restores the opener", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();
    render(<Example confirm={confirm} />);
    const opener = screen.getByRole("button", { name: "Abrir" });
    await user.click(opener);
    expect(
      screen.getByRole("dialog", { name: "Eliminar ejemplo" }),
    ).toHaveAccessibleDescription("Revisa este registro.");
    expect(screen.getByText(/240,00/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
    expect(opener).toHaveFocus();
  });
  it("confirms once, blocks duplicate actions and all dismissal paths until settlement, then restores focus", async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    const confirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<Example confirm={confirm} />);
    const opener = screen.getByRole("button", { name: "Abrir" });
    await user.click(opener);
    const action = screen.getByRole("button", { name: "Eliminar" });
    fireEvent.click(action);
    fireEvent.click(action);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Procesando…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Procesando…");
    expect(
      screen.queryByRole("button", { name: "Cerrar diálogo" }),
    ).not.toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    fireEvent.pointerDown(dialog, { clientX: -5, clientY: -5 });
    fireEvent.pointerUp(dialog, { clientX: -5, clientY: -5 });
    expect(dialog).toHaveAttribute("open");
    await act(async () => finish());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
  it("retains the decision and caller-owned rejection feedback, and allows a successful retry", async () => {
    const user = userEvent.setup();
    const confirm = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network"))
      .mockResolvedValueOnce(undefined);
    render(<Example confirm={confirm} />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se ha eliminado. Inténtalo de nuevo.",
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    expect(screen.getByText(/240,00/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("supports external pending and custom labels without invoking the action", () => {
    const confirm = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={vi.fn()}
        title="Continuar"
        description="Comprueba los datos."
        onConfirm={confirm}
        pending
        cancelLabel="Volver"
        confirmLabel="Continuar"
        pendingLabel="Esperando…"
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("button", { name: "Volver" }),
    ).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Esperando…" }));
    expect(confirm).not.toHaveBeenCalled();
  });
  it.each(["escape", "close", "backdrop"])(
    "allows idle %s dismissal and restores focus",
    async (method) => {
      const user = userEvent.setup();
      render(<Example />);
      const opener = screen.getByRole("button", { name: "Abrir" });
      await user.click(opener);
      const dialog = screen.getByRole("dialog");
      if (method === "escape")
        fireEvent(dialog, new Event("cancel", { cancelable: true }));
      else if (method === "close")
        await user.click(
          screen.getByRole("button", { name: "Cerrar diálogo" }),
        );
      else {
        fireEvent.pointerDown(dialog, { clientX: -5, clientY: -5 });
        fireEvent.pointerUp(dialog, { clientX: -5, clientY: -5 });
      }
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(opener).toHaveFocus();
    },
  );
});
