import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextInput } from "./text-input";

describe("TextInput", () => {
  it("associates explicit labels, native requirements and combined descriptions and recovers from errors", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <>
        <p id="external">Información externa</p>
        <TextInput
          id="name"
          label="Nombre"
          required
          help="Ayuda"
          error="Revisa el texto"
          aria-describedby="external name-help"
        />
      </>,
    );
    const input = screen.getByRole("textbox", { name: "Nombre" });
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription(
      "Información externa Ayuda Revisa el texto",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "external name-help name-error",
    );
    await user.click(screen.getByText("Nombre"));
    expect(input).toHaveFocus();
    await user.type(input, "Nuevo texto");
    rerender(
      <>
        <p id="external">Información externa</p>
        <TextInput
          id="name"
          label="Nombre"
          required
          help="Ayuda"
          aria-describedby="external"
        />
      </>,
    );
    expect(input).toHaveValue("Nuevo texto");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveAccessibleDescription("Información externa Ayuda");
    expect(screen.queryByText("Revisa el texto")).not.toBeInTheDocument();
  });

  it("generates unique stable IDs without dangling descriptions", () => {
    const { rerender } = render(
      <>
        <TextInput label="Uno" />
        <TextInput label="Dos" />
      </>,
    );
    const first = screen.getByRole("textbox", { name: "Uno" });
    const id = first.id;
    expect(id).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Dos" }).id).not.toBe(id);
    expect(first).not.toHaveAttribute("aria-describedby");
    rerender(
      <>
        <TextInput label="Uno" help="Nueva ayuda" />
        <TextInput label="Dos" />
      </>,
    );
    expect(first.id).toBe(id);
    expect(first).toHaveAccessibleDescription("Nueva ayuda");
  });

  it("supports controlled typing, change and blur events and input refs", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const blur = vi.fn();
    const ref = createRef<HTMLInputElement>();
    function Controlled() {
      const [value, setValue] = useState("");
      return (
        <TextInput
          ref={ref}
          label="Concepto"
          name="concept"
          value={value}
          onChange={(event) => {
            change(event.target.value);
            setValue(event.target.value);
          }}
          onBlur={blur}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByRole("textbox", { name: "Concepto" });
    expect(ref.current).toBe(input);
    await user.type(input, "Texto");
    expect(input).toHaveValue("Texto");
    expect(change).toHaveBeenLastCalledWith("Texto");
    expect(input).toHaveAttribute("name", "concept");
    await user.tab();
    expect(blur).toHaveBeenCalledOnce();
  });

  it("preserves long default values and native editing constraints", async () => {
    const user = userEvent.setup();
    const longValue = "Descripción extensa ".repeat(30);
    render(
      <TextInput
        label="Descripción"
        defaultValue={longValue}
        placeholder="Texto libre"
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue(longValue);
    await user.clear(input);
    expect(input).toHaveAttribute("placeholder", "Texto libre");
    await user.type(input, "Reemplazo");
    expect(input).toHaveValue("Reemplazo");
  });

  it("skips disabled inputs and allows focus but no editing for read-only inputs", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <>
        <TextInput
          label="Deshabilitado"
          disabled
          defaultValue="Bloqueado"
          onChange={change}
        />
        <TextInput
          label="Solo lectura"
          readOnly
          defaultValue="Conservado"
          onChange={change}
        />
      </>,
    );
    const disabled = screen.getByRole("textbox", { name: "Deshabilitado" });
    const readOnly = screen.getByRole("textbox", { name: "Solo lectura" });
    expect(disabled).toBeDisabled();
    await user.tab();
    expect(readOnly).toHaveFocus();
    await user.keyboard("Cambio");
    await user.click(disabled);
    await user.keyboard("Cambio");
    expect(disabled).toHaveValue("Bloqueado");
    expect(readOnly).toHaveValue("Conservado");
    expect(change).not.toHaveBeenCalled();
  });

  it("keeps adornments decorative and supports invalid state without an error message", () => {
    render(
      <TextInput
        label="Buscar"
        invalid
        leadingAdornment={
          <svg>
            <title>Lupa</title>
          </svg>
        }
        trailingAdornment={<span>ABC</span>}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Buscar" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("ABC").closest("[aria-hidden]")).toHaveAttribute(
      "inert",
    );
    expect(screen.getByTitle("Lupa").closest("[aria-hidden]")).toHaveAttribute(
      "inert",
    );
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-describedby");
  });
});
