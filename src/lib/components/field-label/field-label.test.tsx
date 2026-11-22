import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FieldLabel } from "./field-label";

describe("FieldLabel", () => {
  it("activates the caller-associated native control and permits keyboard editing", async () => {
    const user = userEvent.setup();
    render(
      <>
        <FieldLabel htmlFor="example">Nombre</FieldLabel>
        <input id="example" />
      </>,
    );
    await user.click(screen.getByText("Nombre"));
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveFocus();
    await user.keyboard("Ejemplo");
    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue(
      "Ejemplo",
    );
  });

  it("forwards native label attributes, events and ref", async () => {
    const ref = createRef<HTMLLabelElement>();
    const click = vi.fn();
    const user = userEvent.setup();
    render(
      <FieldLabel
        ref={ref}
        id="label"
        htmlFor="control"
        title="Ayuda"
        className="custom"
        onClick={click}
      >
        Nombre
      </FieldLabel>,
    );
    await user.click(screen.getByText("Nombre"));
    expect(click).toHaveBeenCalledOnce();
    expect(ref.current).toHaveAttribute("for", "control");
    expect(ref.current).toHaveAttribute("id", "label");
    expect(ref.current).toHaveAttribute("title", "Ayuda");
    expect(ref.current).toHaveClass("custom");
  });
});
