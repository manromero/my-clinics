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
  template_revision: "1",
};

function testClient(fetch: typeof globalThis.fetch) {
  vi.mocked(requireSupabaseSession).mockResolvedValue({
    context: {
      generation: "a".repeat(64),
      expiresAt: 9999999999,
      verifiedAt: 1,
    },
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
        if (url.pathname === "/rest/v1/clinic_templates") return response([]);
        if (url.pathname === "/rest/v1/clinic_templates") return response([]);
        expect(url.pathname).toBe("/rest/v1/clinics");
        expect(url.searchParams.get("select")).toBe(
          "id::text,name,percentage,active,template_revision::text",
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
      ...["9", "10", row.id].map((id) => ({
        id,
        name: row.name,
        percentage: row.percentage,
        active: row.active,
        revision: "1",
        template: undefined,
      })),
    ]);
    expect(fetch).toHaveBeenCalledTimes(2);
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

  it("maps saved metadata through scoped requests", async () => {
    const templateId = "11111111-1111-4111-8111-111111111111";
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response([row]))
      .mockResolvedValueOnce(
        response([{ clinic_id: row.id, template_id: templateId }]),
      )
      .mockResolvedValueOnce(
        response([{ id: templateId, original_filename: "owned.pdf" }]),
      );
    testClient(fetch);
    expect(await listClinics()).toEqual([
      expect.objectContaining({
        revision: "1",
        template: { id: templateId, name: "owned.pdf" },
      }),
    ]);
    expect(String(fetch.mock.calls[1][0])).toContain(row.id);
    expect(String(fetch.mock.calls[2][0])).toContain(templateId);
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
