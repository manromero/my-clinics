// @vitest-environment node

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseSession } from "@/lib/supabase/session";
import { listClinics, type ClinicRow } from "./list-clinics";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/session", () => ({ requireSupabaseSession: vi.fn() }));

const row: ClinicRow = {
  id: "9007199254740993",
  name: "Dental Sintética",
  percentage: 27.5,
  active: false,
};

function testClient(fetch: typeof globalThis.fetch) {
  vi.mocked(requireSupabaseSession).mockResolvedValue({
    client: createClient<Database>(
      "https://myclinics.example",
      "sb_publishable_fixture",
      {
        accessToken: async () => "verified-token",
        global: { fetch },
      },
    ),
    user: { id: "verified-user" } as Awaited<
      ReturnType<typeof requireSupabaseSession>
    >["user"],
  });
}

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Supabase clinic listing", () => {
  it("uses the verified user's token with an exact ID cast and numeric server ordering", async () => {
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
          "Bearer verified-token",
        );
        expect(init?.method).toBe("GET");
        return response([{ ...row, id: "9" }, { ...row, id: "10" }, row]);
      });
    testClient(fetch);
    expect(await listClinics()).toEqual([
      { ...row, id: "9" },
      { ...row, id: "10" },
      row,
    ]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("preserves the signed-out redirect instead of reporting a list failure", async () => {
    const fetch = vi.fn();
    testClient(fetch);
    vi.mocked(requireSupabaseSession).mockRejectedValue(
      new Error("redirect: /login"),
    );
    await expect(listClinics()).rejects.toThrow("redirect: /login");
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    { id: 9007199254740992 },
    { id: "9223372036854775808" },
    { name: " " },
    { percentage: 100.01 },
    { percentage: 1.001 },
    { active: null },
  ])("rejects invalid wire DTO %j without a partial list", async (invalid) => {
    testClient(
      vi.fn().mockResolvedValue(response([row, { ...row, ...invalid }])),
    );
    expect(await listClinics()).toBeNull();
  });

  it("contains API errors and can retry", async () => {
    testClient(
      vi
        .fn()
        .mockResolvedValueOnce(
          response({ message: "sensitive transport error" }, 403),
        )
        .mockResolvedValueOnce(response([])),
    );
    expect(await listClinics()).toBeNull();
    expect(await listClinics()).toEqual([]);
  });
});
