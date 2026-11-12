import { describe, expect, it } from "vitest";
import {
  activityEarnings,
  isActivityDate,
  newActivityDate,
  parseActivityAmount,
} from "./activity-entry";

describe("activity entries", () => {
  it("uses Madrid's date at a month boundary and only reuses a date in the requested month", () => {
    const now = new Date("2026-10-31T23:30:00Z");
    expect(newActivityDate({ year: 2026, month: 11 }, undefined, now)).toBe(
      "2026-11-01",
    );
    expect(newActivityDate({ year: 2026, month: 10 }, undefined, now)).toBe("");
    expect(newActivityDate({ year: 2026, month: 10 }, "2026-10-08", now)).toBe(
      "2026-10-08",
    );
    expect(newActivityDate({ year: 2026, month: 11 }, "2026-10-08", now)).toBe(
      "2026-11-01",
    );
  });

  it("rejects normalized and unsupported calendar dates", () => {
    expect(isActivityDate("2024-02-29")).toBe(true);
    expect(isActivityDate("2026-02-29")).toBe(false);
    expect(isActivityDate("0001-01-01")).toBe(true);
    expect(isActivityDate("0000-01-01")).toBe(false);
    expect(isActivityDate("10000-01-01")).toBe(false);
  });

  it("accepts signed cents and explicit zero without passing through a floating point number", () => {
    expect(parseActivityAmount("-,05")).toBe("-5");
    expect(parseActivityAmount("+0.00")).toBe("0");
    expect(parseActivityAmount("1,005")).toBeNull();
    expect(parseActivityAmount("-0,")).toBeNull();
    expect(parseActivityAmount("9007199254740993,57")).toBe(
      "900719925474099357",
    );
  });

  it("rounds signed gross half-cents before calculating net and rounds negative net half-cents away from zero", () => {
    expect(activityEarnings("-5", null, 5000, 1500)).toEqual({
      grossCents: "-3",
      netCents: "-3",
    });
    expect(activityEarnings("5", null, 5000, 1500)).toEqual({
      grossCents: "3",
      netCents: "3",
    });
    expect(activityEarnings("-1000", "-10", 5000, 1500)).toEqual({
      grossCents: "-10",
      netCents: "-9",
    });
    expect(activityEarnings("-1000", "0", 5000, 1500)).toEqual({
      grossCents: "0",
      netCents: "0",
    });
  });
});
