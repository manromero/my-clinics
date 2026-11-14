import { describe, expect, it } from "vitest";
import { buildSummaryView } from "./summary-view";

const period = { year: 2026, month: 11 };
const historicalId = "9007199254740993";
const emptyInactiveId = "9007199254740992";
const clinics = [
  { id: "1", name: "Activa", active: true },
  { id: "2", name: "Sin actividad", active: true },
  { id: emptyInactiveId, name: "Inactiva sin actividad", active: false },
  { id: historicalId, name: "Histórica", active: false },
];
const groups = [
  {
    clinic_id: "1",
    price: "90071992547409.93",
    gross: "37.01",
    net: "30.95",
    row_count: "50",
  },
  {
    clinic_id: historicalId,
    price: "-1.01",
    gross: "-0.2400",
    net: "-0.21",
    row_count: "2",
  },
];

describe("saved summary", () => {
  it("combines all saved groups without rounding amounts or IDs", () => {
    const summary = buildSummaryView(period, undefined, clinics, groups);
    expect(
      summary.clinics.map(({ clinic, totals }) => [clinic.id, totals.rowCount]),
    ).toEqual([
      ["1", 50],
      ["2", 0],
      [historicalId, 2],
    ]);
    expect(summary.totals).toEqual({
      priceCents: BigInt("9007199254740892"),
      grossCents: BigInt(3677),
      netCents: BigInt(3074),
      rowCount: 52,
    });
  });

  it("limits the figures to a selected historical clinic", () => {
    const summary = buildSummaryView(period, historicalId, clinics, groups);
    expect(summary.clinics.map(({ clinic }) => clinic.id)).toEqual([
      historicalId,
    ]);
    expect(summary.totals).toEqual({
      priceCents: BigInt(-101),
      grossCents: BigInt(-24),
      netCents: BigInt(-21),
      rowCount: 2,
    });
  });

  it("keeps an owned inactive selection without adding an empty breakdown row", () => {
    const summary = buildSummaryView(period, emptyInactiveId, clinics, groups);
    expect(summary.scope.clinicId).toBe(emptyInactiveId);
    expect(summary.clinicOptions.some(({ id }) => id === emptyInactiveId)).toBe(
      true,
    );
    expect(summary.clinics).toEqual([]);
    expect(summary.totals.rowCount).toBe(0);
  });

  it("discards unowned clinic selections and rejects mismatched saved groups", () => {
    expect(
      buildSummaryView(period, "3", clinics, groups).scope.clinicId,
    ).toBeNull();
    expect(() =>
      buildSummaryView(period, "3", clinics, [
        { ...groups[0], clinic_id: "3" },
      ]),
    ).toThrow("Invalid saved summary group");
  });
});
