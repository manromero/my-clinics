import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FieldError } from "./field-error";
import { FieldLabel } from "../field-label/field-label";
import { FieldHelp } from "../field-help/field-help";
import { FieldRequirement } from "../field-requirement/field-requirement";

function Composition() {
  const [error, setError] = useState(true);
  return (
    <>
      <FieldLabel htmlFor="value">Valor</FieldLabel>
      <FieldRequirement required />
      <input
        id="value"
        required
        aria-invalid={error}
        aria-describedby={error ? "help error" : "help"}
      />
      <FieldHelp id="help">Ayuda persistente.</FieldHelp>
      {error && <FieldError id="error">Revisa el valor.</FieldError>}
      <button onClick={() => setError(!error)}>Cambiar error</button>
    </>
  );
}

describe("FieldError", () => {
  it("composes explicit descriptions and caller-owned invalid state across removal/restoration", async () => {
    const user = userEvent.setup();
    render(<Composition />);
    const input = screen.getByRole("textbox", { name: "Valor" });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(
      "Ayuda persistente. Revisa el valor.",
    );
    await user.click(screen.getByRole("button"));
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).toHaveAttribute("aria-describedby", "help");
    expect(input).toHaveAccessibleDescription("Ayuda persistente.");
    expect(screen.queryByText("Revisa el valor.")).not.toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(
      "Ayuda persistente. Revisa el valor.",
    );
  });

  it("forwards native paragraph attributes and ref without forcing a live announcement", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(
      <FieldError ref={ref} id="error" className="custom" aria-live="polite">
        Revisa el valor.
      </FieldError>,
    );
    expect(ref.current?.tagName).toBe("P");
    expect(ref.current).toHaveAttribute("id", "error");
    expect(ref.current).toHaveAttribute("aria-live", "polite");
    expect(ref.current).toHaveClass("custom");
    expect(ref.current).not.toHaveAttribute("role");
  });
});
