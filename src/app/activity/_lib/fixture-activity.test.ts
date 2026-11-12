import { describe, expect, it } from "vitest";
import { fixtureActivity } from "./fixture-activity";

const october = { year: "2026", month: "10" };

describe("activity preview fixtures", () => {
  it("orders dates newest first, breaks same-day ties and sums signed row cents", () => {
    const view = fixtureActivity(october);

    expect(view.rows.map(({ id }) => id)).toEqual([
      "control-octubre",
      "endodoncia-octubre",
      "laboratorio-octubre",
      "ajuste-octubre",
      "guardia-octubre",
      "revision-octubre",
    ]);
    expect(view.totals).toEqual({
      priceCents: "50000",
      grossCents: "24200",
      netCents: "21020",
      rowCount: 6,
    });
  });

  it("totals only the selected clinic and resets an ineligible historical filter", () => {
    const filtered = fixtureActivity({ ...october, clinic: "gran-via" });
    expect(filtered.totals).toEqual({
      priceCents: "9000",
      grossCents: "6200",
      netCents: "5270",
      rowCount: 3,
    });

    const empty = fixtureActivity({
      year: "2026",
      month: "12",
      clinic: "san-jeronimo",
    });
    expect(empty.scope.clinicId).toBeNull();
    expect(empty.rows).toHaveLength(0);
    expect(empty.totals).toEqual({
      priceCents: "0",
      grossCents: "0",
      netCents: "0",
      rowCount: 0,
    });
  });

  it("keeps historical clinics and activity eligible when creation is unavailable", () => {
    const view = fixtureActivity(
      { ...october, clinic: "san-jeronimo" },
      "inactive",
    );

    expect(view.canCreate).toBe(false);
    expect(view.clinicOptions.every(({ active }) => !active)).toBe(true);
    expect(view.scope.clinicId).toBe("san-jeronimo");
    expect(view.rows.map(({ id }) => id)).toEqual(["revision-octubre"]);
    expect(view.totals.netCents).toBe("2338");
  });
});
