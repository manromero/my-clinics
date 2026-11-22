import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clinicSeedTests,
  clinicNegativeControls,
} from "./clinic-database-validation.mjs";

test("seed validation rejects non-reproducible rows", async () => {
  let reads = 0;
  const query = async (sql) => {
    if (!sql.startsWith("select")) return [];
    reads++;
    return [
      { id: reads === 1 ? "stable" : "changed", percentage: "0", active: true },
      { percentage: "100", active: false },
      { percentage: "37.25", active: true },
    ];
  };
  await assert.rejects(clinicSeedTests(query, "seed"), assert.AssertionError);
});

test("clinic negative controls fail if the database accepts a regression", async () => {
  await assert.rejects(
    clinicNegativeControls(async () => [], "assertions"),
    /Database suite must reject regression/,
  );
  await assert.rejects(
    clinicNegativeControls(async () => {
      throw Object.assign(new Error("Transport failure"), { status: 500 });
    }, "assertions"),
    (error) =>
      error instanceof assert.AssertionError && error.actual.status === 500,
  );
});
