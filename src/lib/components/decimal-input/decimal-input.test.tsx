import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DecimalInput, parseDecimal } from "./decimal-input";

describe("parseDecimal", () => {
  it.each<[string, unknown]>([
    ["", { status: "empty" }],
    ...["-", "+", ",", ".", "-.", "12,", "0."].map((raw): [string, unknown] => [
      raw,
      { status: "incomplete" },
    ]),
    ["0", { status: "valid", decimal: "0" }],
    ["-0,00", { status: "valid", decimal: "-0.00" }],
    ["-12,50", { status: "valid", decimal: "-12.50" }],
    ["+0012.50", { status: "valid", decimal: "12.50" }],
    [",5", { status: "valid", decimal: "0.5" }],
    ["-.25", { status: "valid", decimal: "-0.25" }],
    [
      "999999999999999999999,99",
      { status: "valid", decimal: "999999999999999999999.99" },
    ],
    ["1,234", { status: "invalid", reason: "precision" }],
    ["0.000", { status: "invalid", reason: "precision" }],
    ...[
      "1.000,50",
      "1,2.3",
      "1e2",
      " 12",
      "12 ",
      "NaN",
      "--1",
      "€12",
      "12%",
    ].map((raw): [string, unknown] => [
      raw,
      { status: "invalid", reason: "format" },
    ]),
  ])("parses %j without silently coercing it", (raw, expected) => {
    expect(parseDecimal(raw as string)).toEqual(expected);
  });

  it("applies exact inclusive decimal bounds, including negative fractions and large amounts", () => {
    const limits = { min: "-0.25", max: "0.25" };
    expect(parseDecimal("-0,25", limits)).toEqual({
      status: "valid",
      decimal: "-0.25",
    });
    expect(parseDecimal("0.25", limits)).toEqual({
      status: "valid",
      decimal: "0.25",
    });
    expect(parseDecimal("-0.26", limits)).toEqual({
      status: "invalid",
      reason: "min",
    });
    expect(parseDecimal("0,26", limits)).toEqual({
      status: "invalid",
      reason: "max",
    });
    expect(parseDecimal("-0", { min: "0", max: "0" })).toEqual({
      status: "valid",
      decimal: "-0",
    });
    expect(
      parseDecimal("9007199254740992,02", { max: "9007199254740992.01" }),
    ).toEqual({ status: "invalid", reason: "max" });
  });

  it("keeps sign policy separate from range and validates consumer configuration", () => {
    for (const raw of ["-", "-0", "-0,00", "-1"]) {
      expect(parseDecimal(raw, { allowNegative: false })).toEqual({
        status: "invalid",
        reason: "negative",
      });
    }
    expect(parseDecimal("0", { allowNegative: false })).toEqual({
      status: "valid",
      decimal: "0",
    });
    for (const min of ["1,5", "", "NaN", "0.001"])
      expect(() => parseDecimal("", { min })).toThrow();
    expect(() => parseDecimal("1", { min: "2", max: "1" })).toThrow();
  });
});

describe("DecimalInput", () => {
  it("reports raw and parsed edits, retaining punctuation, precision errors and text on blur", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const blur = vi.fn();
    const ref = createRef<HTMLInputElement>();
    function Controlled() {
      const [value, setValue] = useState("");
      const parsed = parseDecimal(value);
      return (
        <DecimalInput
          ref={ref}
          label="Importe (€)"
          name="amount"
          required
          value={value}
          adornment="€"
          help="Hasta dos decimales"
          error={parsed.status === "invalid" ? "Revisa el importe" : undefined}
          onBlur={blur}
          onValueChange={(raw, result) => {
            setValue(raw);
            change(raw, result);
          }}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByRole("textbox", { name: "Importe (€)" });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("name", "amount");
    await user.click(screen.getByText("Importe (€)"));
    expect(input).toHaveFocus();
    await user.type(input, "-0,");
    expect(change).toHaveBeenLastCalledWith("-0,", { status: "incomplete" });
    await user.type(input, "001");
    expect(input).toHaveValue("-0,001");
    expect(change).toHaveBeenLastCalledWith("-0,001", {
      status: "invalid",
      reason: "precision",
    });
    expect(input).toHaveAccessibleDescription(
      "Hasta dos decimales Revisa el importe",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
    await user.tab();
    expect(blur).toHaveBeenCalledOnce();
    expect(input).toHaveValue("-0,001");
    await user.click(input);
    await user.keyboard("{Backspace}");
    expect(change).toHaveBeenLastCalledWith("-0,00", {
      status: "valid",
      decimal: "-0.00",
    });
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("€").closest("[aria-hidden]")).toHaveAttribute(
      "inert",
    );
    await user.clear(input);
    expect(change).toHaveBeenLastCalledWith("", { status: "empty" });
    await user.paste("1.000,50");
    expect(input).toHaveValue("1.000,50");
    expect(change).toHaveBeenLastCalledWith("1.000,50", {
      status: "invalid",
      reason: "format",
    });
  });

  it("uses current restrictions for changes and preserves controlled external updates", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <DecimalInput
        label="Porcentaje"
        value="100"
        max="100"
        onValueChange={change}
      />,
    );
    rerender(
      <DecimalInput
        label="Porcentaje"
        value="10"
        max="10"
        onValueChange={change}
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("10");
    await user.type(input, "1");
    expect(change).toHaveBeenLastCalledWith("101", {
      status: "invalid",
      reason: "max",
    });
  });

  it("skips disabled fields and keeps read-only values selectable without changes", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <>
        <DecimalInput
          label="Deshabilitado"
          value="0"
          disabled
          onValueChange={change}
        />
        <DecimalInput
          label="Lectura"
          value="-12,50"
          readOnly
          onValueChange={change}
        />
      </>,
    );
    expect(
      screen.getByRole("textbox", { name: "Deshabilitado" }),
    ).toBeDisabled();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Lectura" })).toHaveFocus();
    await user.keyboard("123");
    expect(screen.getByRole("textbox", { name: "Lectura" })).toHaveValue(
      "-12,50",
    );
    expect(change).not.toHaveBeenCalled();
  });
});
