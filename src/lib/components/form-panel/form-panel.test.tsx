import { createRef, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FormPanel } from "./form-panel";

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
});
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});

describe("FormPanel", () => {
  it("names the native form, supports keyboard submit, and cancels without submitting", async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    const cancel = vi.fn();
    render(
      <FormPanel
        title="Editar"
        description="Revisa los datos"
        onSubmit={submit}
        onCancel={cancel}
      >
        <label>
          Nombre
          <input name="name" required />
        </label>
      </FormPanel>,
    );
    expect(
      screen.getByRole("region", { name: "Editar" }),
    ).toHaveAccessibleDescription("Revisa los datos");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(submit).not.toHaveBeenCalled();
    await user.type(screen.getByRole("textbox"), "Ejemplo{Enter}");
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit.mock.calls[0][0].defaultPrevented).toBe(true);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("blocks duplicate submits, editing and all modal cancellation while pending", async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    const cancel = vi.fn();
    render(
      <FormPanel
        presentation="modal"
        open
        pending
        title="Editar"
        onSubmit={submit}
        onCancel={cancel}
      >
        <input aria-label="Nombre" defaultValue="Conservado" />
      </FormPanel>,
    );
    expect(screen.getByRole("form")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Guardando…");
    await user.click(screen.getByRole("button", { name: "Guardando…" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.submit(screen.getByRole("form"));
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );
    expect(
      screen.queryByRole("button", { name: "Cerrar diálogo" }),
    ).not.toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
  });

  it("retains caller-owned values through pending, failure and successful retry", async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    function Example() {
      const [value, setValue] = useState("");
      const [pending, setPending] = useState(false);
      const [error, setError] = useState<string>();
      return (
        <>
          <FormPanel
            title="Editar"
            pending={pending}
            error={error}
            onSubmit={() => {
              save(value);
              setPending(true);
            }}
            onCancel={() => {}}
          >
            <input
              aria-label="Nombre"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </FormPanel>
          <button
            onClick={() => {
              setPending(false);
              setError("Conexión interrumpida");
            }}
          >
            Fallar
          </button>
          <button
            onClick={() => {
              setPending(false);
              setError(undefined);
            }}
          >
            Completar
          </button>
        </>
      );
    }
    render(<Example />);
    await user.type(screen.getByRole("textbox"), "Mi edición");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    fireEvent.submit(screen.getByRole("form"));
    expect(save).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Fallar" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Conexión interrumpida",
    );
    expect(screen.getByRole("textbox")).toHaveValue("Mi edición");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(save).toHaveBeenLastCalledWith("Mi edición");
    await user.click(screen.getByRole("button", { name: "Completar" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("Mi edición");
  });

  it("forwards modal initial focus, routes dismissal to cancel and restores the opener", async () => {
    const user = userEvent.setup();
    const cancel = vi.fn();
    const ref = createRef<HTMLInputElement>();
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Abrir</button>
          <FormPanel
            presentation="modal"
            open={open}
            initialFocusRef={ref}
            title="Editar"
            onSubmit={() => {}}
            onCancel={() => {
              cancel();
              setOpen(false);
            }}
          >
            <input ref={ref} aria-label="Nombre" />
          </FormPanel>
        </>
      );
    }
    render(<Example />);
    const opener = screen.getByRole("button", { name: "Abrir" });
    await user.click(opener);
    expect(ref.current).toHaveFocus();
    const title = screen.getByRole("heading", { name: "Editar" });
    expect(title).not.toHaveAttribute("tabindex");
    title.focus();
    expect(ref.current).toHaveFocus();
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { cancelable: true }),
    );
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(opener).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(opener);
    await user.click(screen.getByRole("button", { name: "Cerrar diálogo" }));
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(opener).toHaveFocus();
  });

  it("supports caller validation and customized action labels", async () => {
    const submit = vi.fn();
    const user = userEvent.setup();
    render(
      <FormPanel
        title="Editar"
        noValidate
        onSubmit={submit}
        onCancel={() => {}}
        saveLabel="Aplicar"
        cancelLabel="Volver"
      >
        <input required aria-label="Nombre" />
      </FormPanel>,
    );
    await user.click(screen.getByRole("button", { name: "Aplicar" }));
    expect(submit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
  });
});
