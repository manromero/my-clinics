import { describe, expect, it } from "vitest";
import { parseClinicPercentage } from "./clinic-source";
import { createMemoryClinicSource } from "./memory-clinic-source";

const clinic = {
  id: "one",
  name: "Dental Alameda",
  percentage: 30,
  active: false,
};

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

describe("in-memory clinic source", () => {
  it("lists seeded clinics and creates active clinics with unique stable IDs", async () => {
    const seed = { ...clinic, id: "preview-1" };
    const source = createMemoryClinicSource([seed], { delay: 0 });
    expect(await source.list()).toEqual({ status: "loaded", clinics: [seed] });

    const created = await source.create({
      name: " New Clinic ",
      percentage: 0,
    });
    expect(created).toEqual({
      status: "saved",
      clinic: {
        id: "preview-2",
        name: "New Clinic",
        percentage: 0,
        active: true,
      },
    });
    const changes = { name: "Updated Clinic", percentage: 100, active: false };
    expect(await source.update("preview-2", changes)).toEqual({
      status: "saved",
      clinic: { ...changes, id: "preview-2" },
    });
    expect(await source.list()).toEqual({
      status: "loaded",
      clinics: [seed, { ...changes, id: "preview-2" }],
    });
  });

  it("rejects invalid input and duplicate names, except when keeping a clinic's own name", async () => {
    const source = createMemoryClinicSource([clinic], { delay: 0 });
    expect(await source.create({ name: "  ", percentage: 30 })).toEqual({
      status: "invalid",
      field: "name",
    });
    expect(await source.create({ name: "New", percentage: 0.001 })).toEqual({
      status: "invalid",
      field: "percentage",
    });
    expect(
      await source.create({ name: " dEnTaL AlAmEdA ", percentage: 30 }),
    ).toEqual({ status: "duplicate-name" });

    const duplicate = { name: "New", percentage: 25 };
    const [first, second] = await Promise.all([
      source.create(duplicate),
      source.create(duplicate),
    ]);
    expect(first.status).toBe("saved");
    expect(second.status).toBe("duplicate-name");
    expect(
      await source.update(clinic.id, { ...clinic, name: " new " }),
    ).toEqual({ status: "duplicate-name" });
    expect(await source.update(clinic.id, { ...clinic, active: true })).toEqual(
      { status: "saved", clinic: { ...clinic, active: true } },
    );
  });

  it("shares a pending load and permits retry after a failed load", async () => {
    const source = createMemoryClinicSource([clinic], {
      failure: "load-error",
      delay: 0,
    });
    expect(await Promise.all([source.list(), source.list()])).toEqual([
      { status: "failed" },
      { status: "failed" },
    ]);
    expect(await source.list()).toEqual({
      status: "loaded",
      clinics: [clinic],
    });
  });

  it("leaves the stored clinic intact after a failed update and saves all fields on retry", async () => {
    const source = createMemoryClinicSource([clinic], {
      failure: "save-error",
      delay: 0,
    });
    const changes = { name: "Updated", percentage: 0, active: true };
    expect(await source.update(clinic.id, changes)).toEqual({
      status: "failed",
    });
    expect(await source.list()).toEqual({
      status: "loaded",
      clinics: [clinic],
    });
    expect(await source.update(clinic.id, changes)).toEqual({
      status: "saved",
      clinic: { ...changes, id: clinic.id },
    });
    expect(await source.update("missing", changes)).toEqual({
      status: "failed",
    });
  });
});
