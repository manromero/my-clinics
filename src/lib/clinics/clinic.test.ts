import { describe, expect, it } from "vitest";
import { parseClinicPercentage } from "./clinic";

describe("clinic percentage", () => {
  it.each([
    ["0", "0"],
    [" 0,00 ", "0.00"],
    ["0,01", "0.01"],
    ["99.99", "99.99"],
    ["100,00", "100.00"],
  ])("accepts %s", (input, decimal) => {
    expect(parseClinicPercentage(input)).toEqual({ status: "valid", decimal });
  });

  it.each(["", "   ", "-0,01", "100,01", "0,001", "100.000", "1,", "1e2"])(
    "rejects %j",
    (input) => {
      expect(parseClinicPercentage(input).status).not.toBe("valid");
    },
  );
});
