import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import { listClinics, type ClinicRow } from "./list-clinics";

const row: ClinicRow = {
  id: "9007199254740993",
  name: "Dental Sintética",
  percentage: 27.5,
  active: false,
};

function testClient(fetch: typeof globalThis.fetch) {
  return createClient<Database>(
    "https://myclinics.example",
    "sb_publishable_fixture",
    {
      accessToken: async () => null,
      global: { fetch },
    },
  );
}

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Supabase clinic listing", () => {
  it("uses a publishable key with an exact ID cast and numeric server ordering", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async (input, init) => {
        const url = new URL(String(input));
        expect(url.pathname).toBe("/rest/v1/clinics");
        expect(url.searchParams.get("select")).toBe(
          "id::text,name,percentage,active",
        );
        expect(url.searchParams.get("order")).toBe("id.asc");
        expect(new Headers(init?.headers).get("apikey")).toBe(
          "sb_publishable_fixture",
        );
        expect(new Headers(init?.headers).get("authorization")).toBe(
          "Bearer sb_publishable_fixture",
        );
        expect(init?.method).toBe("GET");
        return response([{ ...row, id: "9" }, { ...row, id: "10" }, row]);
      });
    expect(await listClinics(testClient(fetch))).toEqual([
      { ...row, id: "9" },
      { ...row, id: "10" },
      row,
    ]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    { id: 9007199254740992 },
    { id: "9223372036854775808" },
    { name: " " },
    { percentage: 100.01 },
    { percentage: 1.001 },
    { active: null },
  ])("rejects invalid wire DTO %j without a partial list", async (invalid) => {
    const client = testClient(
      vi.fn().mockResolvedValue(response([row, { ...row, ...invalid }])),
    );
    expect(await listClinics(client)).toBeNull();
  });

  it("contains API errors and can retry", async () => {
    const client = testClient(
      vi
        .fn()
        .mockResolvedValueOnce(
          response({ message: "sensitive transport error" }, 403),
        )
        .mockResolvedValueOnce(response([])),
    );
    expect(await listClinics(client)).toBeNull();
    expect(await listClinics(client)).toEqual([]);
  });
});
