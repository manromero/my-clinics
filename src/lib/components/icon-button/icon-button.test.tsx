import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./icon-button";

const icon = (
  <svg>
    <title>Decorative pencil</title>
  </svg>
);

describe("IconButton", () => {
  it("uses the supplied Spanish name and activates by click, Enter and Space", async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    render(<IconButton label="Editar ejemplo" icon={icon} onClick={click} />);
    const button = screen.getByRole("button", { name: "Editar ejemplo" });
    expect(button).toHaveAccessibleName("Editar ejemplo");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter} ");
    await user.click(button);
    expect(click).toHaveBeenCalledTimes(3);
  });

  it.each([undefined, "", "   "])(
    "renders and activates without diagnostics or a fabricated name for label %j",
    async (label) => {
      const user = userEvent.setup();
      const click = vi.fn();
      const continueAction = vi.fn();
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      try {
        render(
          <main>
            <h1>Página del ejemplo</h1>
            <IconButton
              {...(label === undefined ? {} : { label })}
              icon={icon}
              onClick={click}
            />
            <button onClick={continueAction}>Continuar</button>
          </main>,
        );
        const button = screen.getByRole("button", { name: "" });
        expect(button).toHaveAccessibleName("");
        await user.tab();
        expect(button).toHaveFocus();
        await user.keyboard("{Enter} ");
        await user.click(button);
        expect(click).toHaveBeenCalledTimes(3);
        expect(
          screen.getByRole("heading", { name: "Página del ejemplo" }),
        ).toBeVisible();
        await user.click(screen.getByRole("button", { name: "Continuar" }));
        expect(continueAction).toHaveBeenCalledOnce();
        expect(warn).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
        error.mockRestore();
      }
    },
  );

  it.each([
    { disabled: true },
    { pending: true },
    { disabled: true, pending: true },
  ])("blocks activation and keyboard focus for %o", async (state) => {
    const user = userEvent.setup();
    const click = vi.fn();
    render(
      <>
        <IconButton
          label="Eliminar ejemplo"
          icon={icon}
          onClick={click}
          {...state}
        />
        <button>Siguiente</button>
      </>,
    );
    const button = screen.getByRole("button", { name: "Eliminar ejemplo" });
    expect(button).toBeDisabled();
    if (state.pending) expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    await user.tab();
    expect(screen.getByRole("button", { name: "Siguiente" })).toHaveFocus();
    button.focus();
    await user.keyboard("{Enter} ");
    expect(click).not.toHaveBeenCalled();
  });

  it("preserves its name and ref through pending and restores activation", async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(
      <IconButton
        ref={ref}
        label="Mes siguiente"
        icon={icon}
        pending
        onClick={click}
      />,
    );
    expect(ref.current).toBe(
      screen.getByRole("button", { name: "Mes siguiente" }),
    );
    rerender(
      <>
        <IconButton
          ref={ref}
          label="Mes siguiente"
          icon={icon}
          onClick={click}
          aria-describedby="help"
        />
        <p id="help">Cambia el periodo del ejemplo</p>
      </>,
    );
    expect(ref.current).not.toBeDisabled();
    expect(ref.current).not.toHaveAttribute("aria-busy");
    expect(ref.current).toHaveAccessibleDescription(
      "Cambia el periodo del ejemplo",
    );
    await user.click(ref.current!);
    expect(click).toHaveBeenCalledOnce();
  });

  it("defaults to a safe action and forwards explicit form submission", async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <IconButton label="Editar" icon={icon} />
        <IconButton
          label="Enviar"
          icon={icon}
          type="submit"
          name="action"
          value="send"
        />
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(submit).not.toHaveBeenCalled();
    const send = screen.getByRole("button", { name: "Enviar" });
    expect(send).toHaveAttribute("name", "action");
    expect(send).toHaveAttribute("value", "send");
    await user.click(send);
    expect(submit).toHaveBeenCalledOnce();
  });
});
