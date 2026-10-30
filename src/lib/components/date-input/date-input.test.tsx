import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateInput } from "./date-input";

describe("DateInput", () => {
  it("associates labels, requirements and deduplicated descriptions and removes errors", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <>
        <p id="external">Información externa</p>
        <DateInput
          id="date"
          label="Fecha"
          required
          help="Ayuda"
          error="Revisa la fecha"
          aria-describedby="external date-help"
        />
      </>,
    );
    const input = screen.getByLabelText("Fecha");
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription(
      "Información externa Ayuda Revisa la fecha",
    );
    expect(input).toHaveAttribute(
      "aria-describedby",
      "external date-help date-error",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    await user.click(screen.getByText("Fecha"));
    expect(input).toHaveFocus();
    rerender(
      <>
        <p id="external">Información externa</p>
        <DateInput
          id="date"
          label="Fecha"
          help="Ayuda"
          aria-describedby="external"
        />
      </>,
    );
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveAccessibleDescription("Información externa Ayuda");
  });

  it("passes controlled date strings, empty changes, refs, names and blur without converting dates", async () => {
    const change = vi.fn();
    const blur = vi.fn();
    const ref = createRef<HTMLInputElement>();
    function Controlled() {
      const [value, setValue] = useState("2026-03-29");
      return (
        <DateInput
          label="Fecha"
          name="date"
          ref={ref}
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
    const input = screen.getByLabelText("Fecha");
    expect(ref.current).toBe(input);
    expect(input).toHaveValue("2026-03-29");
    expect(input).toHaveAttribute("name", "date");
    fireEvent.change(input, { target: { value: "2026-10-25" } });
    expect(change).toHaveBeenLastCalledWith("2026-10-25");
    expect(input).toHaveValue("2026-10-25");
    fireEvent.change(input, { target: { value: "" } });
    expect(change).toHaveBeenLastCalledWith("");
    expect(input).toHaveValue("");
    input.focus();
    await userEvent.setup().tab();
    expect(blur).toHaveBeenCalledOnce();
  });

  it("uses native invalid-date sanitization, empty requirements and inclusive bounds without clamping", () => {
    render(
      <DateInput label="Fecha" required min="2024-02-01" max="2024-02-29" />,
    );
    const input = screen.getByLabelText<HTMLInputElement>("Fecha");
    expect(input.validity.valueMissing).toBe(true);
    for (const value of ["2024-02-01", "2024-02-29"]) {
      fireEvent.change(input, { target: { value } });
      expect(input.checkValidity()).toBe(true);
    }
    fireEvent.change(input, { target: { value: "2024-01-31" } });
    expect(input.validity.rangeUnderflow).toBe(true);
    expect(input).toHaveValue("2024-01-31");
    fireEvent.change(input, { target: { value: "2024-03-01" } });
    expect(input.validity.rangeOverflow).toBe(true);
    fireEvent.change(input, { target: { value: "2024-02-30" } });
    expect(input).toHaveValue("");
    expect(input.validity.valueMissing).toBe(true);
  });

  it("has optional empty values, unique stable IDs and no dangling descriptions", () => {
    const { rerender } = render(
      <>
        <DateInput label="Uno" />
        <DateInput label="Dos" invalid />
      </>,
    );
    const first = screen.getByLabelText<HTMLInputElement>("Uno");
    const id = first.id;
    expect(first.checkValidity()).toBe(true);
    expect(first).toHaveValue("");
    expect(first).not.toHaveAttribute("aria-describedby");
    expect(screen.getByLabelText("Dos").id).not.toBe(id);
    expect(screen.getByLabelText("Dos")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    rerender(<DateInput label="Uno" help="Nueva ayuda" />);
    expect(first.id).toBe(id);
    expect(first).toHaveAccessibleDescription("Nueva ayuda");
  });

  it("skips disabled inputs and preserves read-only dates during keyboard editing", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <>
        <DateInput
          label="Deshabilitada"
          disabled
          defaultValue="2026-10-15"
          onChange={change}
        />
        <DateInput
          label="Lectura"
          readOnly
          defaultValue="2026-10-25"
          onChange={change}
        />
      </>,
    );
    expect(screen.getByLabelText("Deshabilitada")).toBeDisabled();
    await user.tab();
    expect(screen.getByLabelText("Lectura")).toHaveFocus();
    await user.keyboard("{ArrowUp}{Backspace}");
    expect(screen.getByLabelText("Lectura")).toHaveValue("2026-10-25");
    expect(change).not.toHaveBeenCalled();
  });
});
