import { createRef, useState, type RefObject } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./dialog";

// jsdom has no modal top layer or native initial-focus algorithm. Check both live in Chrome.
let nativeInitialFocus: HTMLElement | null = null;
beforeEach(() => {
  nativeInitialFocus = null;
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
      nativeInitialFocus?.focus();
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});
function Example({ dismissible = true }: { dismissible?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Información"
        description="Revisa el contenido."
        dismissible={dismissible}
        actions={<button onClick={() => setOpen(false)}>Terminar</button>}
      >
        <p>Contenido</p>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("preserves native initial focus, names the dialog, keeps the title unfocusable, and restores the opener", async () => {
    const user = userEvent.setup();
    render(<Example />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const opener = screen.getByRole("button", { name: "Abrir" });
    nativeInitialFocus = screen.getByLabelText("Cerrar diálogo");
    await user.click(opener);
    expect(
      screen.getByRole("dialog", { name: "Información" }),
    ).toHaveAccessibleDescription("Revisa el contenido.");
    expect(nativeInitialFocus).toHaveFocus();
    const title = screen.getByRole("heading", { name: "Información" });
    expect(title).not.toHaveAttribute("tabindex");
    title.focus();
    expect(nativeInitialFocus).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    await user.click(screen.getByRole("button", { name: "Terminar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("requests controlled closing from the close button and Escape without native uncontrolled dismissal", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <Dialog open onOpenChange={change} title="Aviso">
        Texto
      </Dialog>,
    );
    await user.click(screen.getByRole("button", { name: "Cerrar diálogo" }));
    expect(change).toHaveBeenCalledWith(false);
    change.mockClear();
    expect(
      fireEvent(
        screen.getByRole("dialog"),
        new Event("cancel", { bubbles: false, cancelable: true }),
      ),
    ).toBe(false);
    expect(change).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
  });

  it("dismisses only when the pointer starts and ends outside the panel", () => {
    const change = vi.fn();
    render(
      <Dialog open onOpenChange={change} title="Aviso">
        Texto
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({
      left: 100,
      right: 500,
      top: 100,
      bottom: 500,
    } as DOMRect);
    fireEvent.pointerDown(dialog, { clientX: 110, clientY: 110 });
    fireEvent.pointerUp(dialog, { clientX: 5, clientY: 5 });
    expect(change).not.toHaveBeenCalled();
    fireEvent.pointerDown(dialog, { clientX: 5, clientY: 5 });
    fireEvent.pointerUp(dialog, { clientX: 110, clientY: 110 });
    expect(change).not.toHaveBeenCalled();
    fireEvent.pointerDown(dialog, { clientX: 5, clientY: 5 });
    fireEvent.pointerUp(dialog, { clientX: 5, clientY: 5 });
    expect(change).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("blocks incidental dismissal while retaining an explicit exit", async () => {
    const user = userEvent.setup();
    render(<Example dismissible={false} />);
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    expect(
      screen.queryByRole("button", { name: "Cerrar diálogo" }),
    ).not.toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("closedby", "none");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    fireEvent.pointerDown(dialog, { clientX: -5, clientY: -5 });
    fireEvent.pointerUp(dialog, { clientX: -5, clientY: -5 });
    expect(dialog).toHaveAttribute("open");
    await user.click(screen.getByRole("button", { name: "Terminar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports custom initial focus and restores body overflow on controlled close and unmount", () => {
    const ref = createRef<HTMLButtonElement>();
    document.body.style.overflow = "auto";
    const { rerender, unmount } = render(
      <Dialog open onOpenChange={() => {}} title="Acción" initialFocusRef={ref}>
        <button ref={ref}>Continuar</button>
      </Dialog>,
    );
    expect(ref.current).toHaveFocus();
    rerender(
      <Dialog open={false} onOpenChange={() => {}} title="Acción">
        Texto
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe("auto");
    rerender(
      <Dialog open onOpenChange={() => {}} title="Acción">
        Texto
      </Dialog>,
    );
    unmount();
    expect(document.body.style.overflow).toBe("auto");
    document.body.style.overflow = "";
  });
});

describe("Dialog initial-focus overrides", () => {
  it.each(["disabled", "nonfocusable", "outside"])(
    "retains native focus for a %s override",
    (kind) => {
      const ref = createRef<HTMLElement>();
      const { rerender } = render(
        <>
          <button
            ref={
              kind === "outside"
                ? (ref as RefObject<HTMLButtonElement>)
                : undefined
            }
          >
            Outside
          </button>
          <Dialog
            open={false}
            onOpenChange={() => {}}
            title="Información"
            initialFocusRef={ref}
          >
            {kind === "disabled" ? (
              <button ref={ref as RefObject<HTMLButtonElement>} disabled>
                Unavailable
              </button>
            ) : kind === "nonfocusable" ? (
              <p ref={ref as RefObject<HTMLParagraphElement>}>Text</p>
            ) : null}
          </Dialog>
        </>,
      );
      nativeInitialFocus = screen.getByLabelText("Cerrar diálogo");
      rerender(
        <>
          <button
            ref={
              kind === "outside"
                ? (ref as RefObject<HTMLButtonElement>)
                : undefined
            }
          >
            Outside
          </button>
          <Dialog
            open
            onOpenChange={() => {}}
            title="Información"
            initialFocusRef={ref}
          >
            {kind === "disabled" ? (
              <button ref={ref as RefObject<HTMLButtonElement>} disabled>
                Unavailable
              </button>
            ) : kind === "nonfocusable" ? (
              <p ref={ref as RefObject<HTMLParagraphElement>}>Text</p>
            ) : null}
          </Dialog>
        </>,
      );
      expect(nativeInitialFocus).toHaveFocus();
      expect(screen.getByRole("heading")).not.toHaveAttribute("tabindex");
    },
  );

  it("opens safely without controls while leaving the title out of the focus order", () => {
    render(
      <Dialog open dismissible={false} onOpenChange={() => {}} title="En curso">
        <p>Espera un momento.</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog", { name: "En curso" })).toHaveAttribute(
      "open",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("heading")).not.toHaveAttribute("tabindex");
  });
});

it("moves native scroll-region focus to the first available control without focusing the heading", () => {
  const content = (open: boolean) => (
    <Dialog
      open={open}
      dismissible={false}
      onOpenChange={() => {}}
      title="Revisar"
      actions={<button>Terminar</button>}
    >
      <p>Contenido largo</p>
      <fieldset disabled>
        <input aria-label="No disponible" />
      </fieldset>
      <input aria-label="Primera opción" />
      <button>Otra opción</button>
    </Dialog>
  );
  const { rerender } = render(content(false));
  const scrollRegion = screen.getByText("Contenido largo").parentElement!;
  // Model the browser choosing its focusable scroll region, not a control search.
  scrollRegion.tabIndex = -1;
  nativeInitialFocus = scrollRegion;
  rerender(content(true));
  expect(screen.getByRole("textbox", { name: "Primera opción" })).toHaveFocus();
  expect(screen.getByRole("heading")).not.toHaveAttribute("tabindex");
});
