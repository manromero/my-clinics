import { describe, expect, it } from "vitest";
import {
  createSupabaseClinicRepository,
  mapClinic,
  type ClinicRow,
} from "./clinic-repository";
import { createClinicService } from "../clinics/clinic-service";

const row: ClinicRow = {
  id: "9007199254740993",
  name: "Dental Sintética",
  percentage: 27.5,
  active: false,
};

describe("PostgreSQL clinic mapping and service outcomes", () => {
  it("preserves exact bigint IDs and maps all business fields", async () => {
    const service = createClinicService(
      createSupabaseClinicRepository({ listClinics: async () => [row] }),
    );
    expect(await service.list()).toEqual({ status: "loaded", clinics: [row] });
    expect(await service.create({ name: "Otra", percentage: 20 })).toEqual({
      status: "failed",
    });
    expect(await service.update(row.id, { ...row, active: true })).toEqual({
      status: "failed",
    });
    expect(service.deletion).toBeUndefined();
  });
  it.each([
    { id: 9007199254740992 },
    { id: "9223372036854775808" },
    { name: " " },
    { percentage: NaN },
    { percentage: 100.01 },
    { percentage: 1.001 },
    { active: null },
  ])("rejects invalid DTO %j without partial list", async (invalid) => {
    const bad = { ...row, ...invalid } as ClinicRow;
    expect(() => mapClinic(bad)).toThrow();
    expect(
      await createSupabaseClinicRepository({
        listClinics: async () => [row, bad],
      }).list(),
    ).toEqual({ status: "failed" });
  });
  it("maps transport errors without leaking infrastructure details, then retries", async () => {
    let failed = true;
    const service = createClinicService(
      createSupabaseClinicRepository({
        listClinics: async () => {
          if (failed) {
            failed = false;
            throw new Error("postgres://secret@host");
          }
          return [];
        },
      }),
    );
    expect(await service.list()).toEqual({ status: "failed" });
    expect(await service.list()).toEqual({ status: "loaded", clinics: [] });
  });
  it("contains unexpected repository errors at the service boundary", async () => {
    const service = createClinicService({
      list: async () => {
        throw new Error("secret");
      },
    });
    expect(await service.list()).toEqual({ status: "failed" });
    expect(await service.create({ name: " ", percentage: 20 })).toEqual({
      status: "invalid",
      field: "name",
    });
    expect(await service.create({ name: "Clinic", percentage: 0.001 })).toEqual(
      { status: "invalid", field: "percentage" },
    );
  });
});
