import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import {
  createBrowserClinicSource,
  type ClinicRow,
} from "./browser-clinic-source";

const row: ClinicRow = {
  id: "9007199254740993",
  name: "Dental Sintética",
  percentage: 27.5,
  active: false,
};

function transport(fetch: typeof globalThis.fetch) {
  const client = createClient<Database>(
    "https://myclinics.example",
    "sb_publishable_fixture",
    {
      accessToken: async () => "synthetic-user-session",
      global: { fetch },
    },
  );
  return createBrowserClinicSource(client);
}

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Supabase browser clinic source", () => {
  it("uses the session with an exact ID cast and numeric server ordering", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async (input, init) => {
        const url = new URL(String(input));
        expect(url.pathname).toBe("/rest/v1/clinics");
        expect(url.searchParams.get("select")).toBe(
          "id::text,name,percentage,active",
        );
        expect(url.searchParams.get("order")).toBe("id.asc");
        expect(new Headers(init?.headers).get("authorization")).toBe(
          "Bearer synthetic-user-session",
        );
        expect(init?.method).toBe("GET");
        return response([{ ...row, id: "9" }, { ...row, id: "10" }, row]);
      });
    const source = transport(fetch);
    expect(await source.list()).toEqual({
      status: "loaded",
      clinics: [{ ...row, id: "9" }, { ...row, id: "10" }, row],
    });
    expect(await source.create({ name: "Otra", percentage: 20 })).toEqual({
      status: "failed",
    });
    expect(await source.update(row.id, { ...row, active: true })).toEqual({
      status: "failed",
    });
    expect(source.deletion).toBeUndefined();
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
    const source = transport(
      vi.fn().mockResolvedValue(response([row, { ...row, ...invalid }])),
    );
    expect(await source.list()).toEqual({ status: "failed" });
  });

  it("contains API errors and can retry", async () => {
    const source = transport(
      vi
        .fn()
        .mockResolvedValueOnce(
          response({ message: "sensitive transport error" }, 403),
        )
        .mockResolvedValueOnce(response([])),
    );
    expect(await source.list()).toEqual({ status: "failed" });
    expect(await source.list()).toEqual({ status: "loaded", clinics: [] });
  });
});
