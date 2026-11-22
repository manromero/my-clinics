import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldHelp } from "./field-help";

describe("FieldHelp", () => {
  it("provides a description using the caller's explicit ID without replacing the name", () => {
    render(
      <>
        <label htmlFor="description">Descripción</label>
        <textarea id="description" aria-describedby="help" />
        <FieldHelp id="help">
          Puedes dejarla vacía. <strong>Es opcional.</strong>
        </FieldHelp>
      </>,
    );
    const control = screen.getByRole("textbox", { name: "Descripción" });
    expect(control).toHaveAccessibleDescription(
      "Puedes dejarla vacía. Es opcional.",
    );
    expect(control).toBeValid();
  });

  it("forwards native paragraph attributes and ref", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(
      <FieldHelp ref={ref} id="help" lang="es" className="custom" role="note">
        Ayuda
      </FieldHelp>,
    );
    expect(screen.getByRole("note")).toBe(ref.current);
    expect(ref.current).toHaveAttribute("id", "help");
    expect(ref.current).toHaveAttribute("lang", "es");
    expect(ref.current).toHaveClass("custom");
  });
});
