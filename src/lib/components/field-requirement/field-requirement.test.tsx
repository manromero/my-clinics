import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldRequirement } from "./field-requirement";

describe("FieldRequirement", () => {
  it("shows optional by default and updates to required without changing native control policy", () => {
    const { rerender } = render(
      <>
        <FieldRequirement />
        <input aria-label="Valor" />
      </>,
    );
    expect(screen.getByText("Opcional")).toBeVisible();
    rerender(
      <>
        <FieldRequirement required />
        <input aria-label="Valor" />
      </>,
    );
    expect(screen.getByText("Obligatorio")).toBeVisible();
    expect(screen.queryByText("Opcional")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).not.toBeRequired();
  });

  it("forwards span attributes and ref for explicit descriptions", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <>
        <FieldRequirement
          ref={ref}
          id="requirement"
          title="Estado"
          className="custom"
          required
        />
        <input aria-label="Valor" aria-describedby="requirement" required />
      </>,
    );
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "Obligatorio",
    );
    expect(screen.getByRole("textbox")).toBeRequired();
    expect(ref.current).toHaveAttribute("title", "Estado");
    expect(ref.current).toHaveClass("custom");
  });
});
