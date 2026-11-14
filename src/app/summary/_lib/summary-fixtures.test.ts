import { describe, expect, it } from "vitest";
import { getSummaryFixtures } from "./summary-fixtures";

describe("monthly summary fixtures", () => {
  it("counts signed and zero rows and sums the rounded cent values", () => {
    const november = getSummaryFixtures({ year: 2026, month: 11 }, undefined);

    expect(november.totals).toEqual({
      priceCents: BigInt(461000),
      grossCents: BigInt(137750),
      netCents: BigInt(117087),
      rowCount: 7,
    });
    expect(november.clinics.map(({ totals }) => totals.rowCount)).toEqual([
      2, 3, 1, 1, 0,
    ]);
  });

  it("keeps an inactive selection when moving to a month without its rows", () => {
    const clinicId = "demo-san-jeronimo";
    const november = getSummaryFixtures({ year: 2026, month: 11 }, clinicId);
    const october = getSummaryFixtures({ year: 2026, month: 10 }, clinicId);

    expect(november.clinics.map(({ clinic }) => clinic.id)).toEqual([clinicId]);
    expect(november.totals).toEqual({
      priceCents: BigInt(-12000),
      grossCents: BigInt(-2400),
      netCents: BigInt(-2040),
      rowCount: 1,
    });
    expect(october.scope.clinicId).toBe(clinicId);
    expect(october.clinicOptions.some(({ id }) => id === clinicId)).toBe(true);
    expect(october.clinics).toEqual([]);
    expect(october.totals).toEqual({
      priceCents: BigInt(0),
      grossCents: BigInt(0),
      netCents: BigInt(0),
      rowCount: 0,
    });
  });
});
