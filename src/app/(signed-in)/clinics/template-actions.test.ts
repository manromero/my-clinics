// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { requireSupabaseActionSession } from "@/lib/supabase/session";
import { createTemplateServer } from "@/lib/templates/server";
import { TemplateError } from "@/lib/templates/infrastructure";
import {
  beginClinicSave,
  finishClinicSave,
  cancelClinicSave,
} from "./template-actions";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/session", () => ({
  requireSupabaseActionSession: vi.fn(),
}));
vi.mock("@/lib/templates/server", () => ({ createTemplateServer: vi.fn() }));
const server = {
  begin: vi.fn(),
  outcome: vi.fn(),
  validate: vi.fn(),
  commit: vi.fn(),
  cancel: vi.fn(),
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requireSupabaseActionSession).mockResolvedValue({
    client: {},
  } as never);
  vi.mocked(createTemplateServer).mockReturnValue(server as never);
  server.outcome.mockResolvedValue(null);
  server.commit.mockResolvedValue({ clinicId: "1", cleanupPending: false });
});
it("verifies every action session and preserves session redirects", async () => {
  vi.mocked(requireSupabaseActionSession).mockRejectedValue(
    new Error("redirect login"),
  );
  await expect(finishClinicSave("id")).rejects.toThrow("redirect login");
  await expect(cancelClinicSave("id")).rejects.toThrow("redirect login");
  expect(server.commit).not.toHaveBeenCalled();
});
it("uses authoritative validation before committing even when local inspection was bypassed", async () => {
  server.validate.mockResolvedValue({
    valid: false,
    reason: "missing-fields",
    fields: ["net_amount"],
  });
  expect(await finishClinicSave("id")).toMatchObject({
    status: "failed",
    reset: true,
    message: expect.stringContaining("net_amount"),
  });
  expect(server.commit).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});
it("retires a failed validation lease while preserving retry values", async () => {
  server.validate.mockRejectedValue(new Error("download unavailable"));
  expect(await finishClinicSave("id")).toMatchObject({
    status: "failed",
    reset: true,
  });
  expect(server.cancel).toHaveBeenCalledWith("id");
  expect(server.commit).not.toHaveBeenCalled();
});
it("resolves a lost commit reply from its recorded outcome and invalidates every consumer", async () => {
  server.outcome.mockResolvedValue({ clinicId: "1", cleanupPending: true });
  expect(await finishClinicSave("id")).toEqual({
    status: "saved",
    cleanupPending: true,
  });
  expect(server.validate).not.toHaveBeenCalled();
  expect(server.commit).not.toHaveBeenCalled();
  for (const route of ["/clinics", "/invoices", "/activity", "/summary"])
    expect(revalidatePath).toHaveBeenCalledWith(route);
});
it("returns revision conflicts with explicit recovery guidance", async () => {
  server.commit.mockRejectedValue(new TemplateError("PT409"));
  expect(await finishClinicSave("id")).toMatchObject({
    status: "failed",
    reset: true,
    message: expect.stringContaining("Otra sesión"),
  });
});
it("Cancel after an uncertain successful Save reports saved rather than undoing it", async () => {
  server.cancel.mockResolvedValue({
    outcome: { cleanupPending: false },
    cleanupPending: false,
  });
  expect(await cancelClinicSave("id")).toEqual({
    status: "saved",
    cleanupPending: false,
  });
});
it("treats cancellation of a never-created reservation as an owner-scoped no-op", async () => {
  server.cancel.mockRejectedValue(new TemplateError("42501"));
  expect(await cancelClinicSave("id")).toEqual({
    status: "cancelled",
    cleanupPending: false,
  });
});
it("validates clinic fields before invoking the privileged reservation", async () => {
  expect(
    (await beginClinicSave({ name: " ", percentage: 101 } as never)).status,
  ).toBe("invalid");
  expect(server.begin).not.toHaveBeenCalled();
});
