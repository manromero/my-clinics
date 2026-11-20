import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { beforeEach, expect, it, vi } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import { requireSupabaseActionSession } from "@/lib/supabase/session";
import { deleteClinic } from "./delete-clinic";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/session", () => ({
  requireSupabaseActionSession: vi.fn(),
}));

const fetch = vi.fn<typeof globalThis.fetch>();
const requireSession = vi.mocked(requireSupabaseActionSession);
const user = { id: "verified-owner" } as Awaited<
  ReturnType<typeof requireSupabaseActionSession>
>["user"];
const clinicId = "9223372036854775807";

beforeEach(() => {
  vi.resetAllMocks();
  requireSession.mockResolvedValue({
    user,
    client: createClient<Database>(
      "https://myclinics.example",
      "sb_publishable_fixture",
      { accessToken: async () => "verified-token", global: { fetch } },
    ),
  });
});

it("requires a verified matching session and a valid bigint clinic ID before calling the Data API", async () => {
  requireSession.mockRejectedValueOnce(new Error("redirect: /login"));
  await expect(deleteClinic(clinicId, user.id)).rejects.toThrow("/login");
  expect(await deleteClinic(clinicId, "other-owner")).toBe("session-changed");
  expect(await deleteClinic("9223372036854775808", user.id)).toBe("failed");
  expect(fetch).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});

it("calls the scoped RPC with the exact ID and invalidates both routes after deletion", async () => {
  fetch.mockResolvedValue(Response.json(clinicId));
  expect(await deleteClinic(clinicId, user.id)).toBe("deleted");
  expect(fetch).toHaveBeenCalledExactlyOnceWith(
    "https://myclinics.example/rest/v1/rpc/delete_clinic",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ p_id: clinicId }),
    }),
  );
  expect(revalidatePath).toHaveBeenCalledTimes(2);
  expect(revalidatePath).toHaveBeenCalledWith("/clinics");
  expect(revalidatePath).toHaveBeenCalledWith("/activity");
});

it.each([
  ["23503", "Clinic has saved activity", "linked-activity"],
  ["23503", "Other reference", "failed"],
  ["42501", "Clinic is unavailable", "missing"],
])("maps %s %j to %s without refreshing", async (code, message, result) => {
  fetch.mockResolvedValue(Response.json({ code, message }, { status: 409 }));
  expect(await deleteClinic(clinicId, user.id)).toBe(result);
  expect(revalidatePath).not.toHaveBeenCalled();
});
