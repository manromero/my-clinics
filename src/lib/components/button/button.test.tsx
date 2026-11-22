import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("activates by click, Enter and Space with a stable text name and decorative icons", async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    render(
      <Button
        onClick={click}
        startIcon={
          <svg>
            <title>Añadir</title>
          </svg>
        }
        endIcon={
          <svg>
            <title>Flecha</title>
          </svg>
        }
      >
        Nueva entrada
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Nueva entrada" });
    await user.click(button);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(click).toHaveBeenCalledTimes(3);
    expect(button).toHaveFocus();
  });

  it.each([
    { disabled: true },
    { pending: true },
    { pending: true, disabled: true },
  ])("prevents activation and skips keyboard focus for %o", async (state) => {
    const user = userEvent.setup();
    const click = vi.fn();
    render(
      <>
        <Button {...state} onClick={click}>
          Guardar
        </Button>
        <Button>Siguiente</Button>
      </>,
    );
    const button = screen.getByRole("button", { name: "Guardar" });
    expect(button).toBeDisabled();
    if (state.pending) expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    await user.tab();
    expect(screen.getByRole("button", { name: "Siguiente" })).toHaveFocus();
    button.focus();
    await user.keyboard("{Enter} ");
    expect(click).not.toHaveBeenCalled();
  });

  it("defaults to a non-submitting action and submits only when explicitly requested", async () => {
    const user = userEvent.setup();
    const submit = vi.fn((event) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={submit}>
        <Button>Cancelar</Button>
        <Button type="submit" name="action" value="save">
          Guardar
        </Button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(submit).not.toHaveBeenCalled();
    const save = screen.getByRole("button", { name: "Guardar" });
    expect(save).toHaveAttribute("name", "action");
    expect(save).toHaveAttribute("value", "save");
    await user.click(save);
    expect(submit).toHaveBeenCalledOnce();
    rerender(
      <form onSubmit={submit}>
        <Button type="submit" pending>
          Guardar
        </Button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(submit).toHaveBeenCalledOnce();
  });

  it("forwards refs and descriptions and restores activation after pending", async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(
      <Button ref={ref} pending onClick={click}>
        Guardar
      </Button>,
    );
    expect(ref.current).toBe(screen.getByRole("button"));
    rerender(
      <>
        <Button ref={ref} onClick={click} aria-describedby="help">
          Guardar
        </Button>
        <p id="help">Solo el ejemplo</p>
      </>,
    );
    expect(ref.current).toHaveAccessibleDescription("Solo el ejemplo");
    expect(ref.current).not.toBeDisabled();
    expect(ref.current).not.toHaveAttribute("aria-busy");
    await user.click(ref.current!);
    expect(click).toHaveBeenCalledOnce();
  });
});
