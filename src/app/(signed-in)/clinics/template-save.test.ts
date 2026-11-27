// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import {
  beginClinicSave,
  finishClinicSave,
  cancelClinicSave,
} from "./template-actions";
import {
  saveClinicTemplate,
  cancelTemplateAttempt,
  type ClinicSaveAttempt,
} from "./template-save";

const upload = vi.hoisted(() => vi.fn());
vi.mock("./template-actions", () => ({
  beginClinicSave: vi.fn(),
  finishClinicSave: vi.fn(),
  cancelClinicSave: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    storage: { from: () => ({ uploadToSignedUrl: upload }) },
  }),
}));
function attempts() {
  return {
    current: null as ClinicSaveAttempt | null,
    set(value: ClinicSaveAttempt | null) {
      this.current = value;
    },
  };
}
function data(name = "Synthetic clinic") {
  const form = new FormData();
  form.set("name", name);
  form.set("percentage", "25,50");
  return form;
}
const file = new File(["synthetic bytes"], "synthetic.pdf", {
  type: "application/pdf",
});
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(beginClinicSave).mockImplementation(async (input) => ({
    status: "ready",
    reservation: {
      requestId: input.requestId,
      state: "pending",
      outcome: null,
      uploadPath: "owned/request.pdf",
      uploadGrant: {
        token: "file-scoped",
        expiresAt: 9999999999,
        transport: "signed-standard",
      },
    },
  }));
  vi.mocked(finishClinicSave).mockResolvedValue({
    status: "saved",
    cleanupPending: false,
  });
  vi.mocked(cancelClinicSave).mockResolvedValue({
    status: "cancelled",
    cleanupPending: false,
  });
  upload.mockResolvedValue({ error: null });
});
it("uploads only on Save, sends identity but no File to the action and commits once", async () => {
  const state = attempts();
  expect(
    await saveClinicTemplate(
      data(),
      { kind: "replace", file },
      undefined,
      state,
    ),
  ).toEqual({ status: "saved", cleanupPending: false });
  expect(beginClinicSave).toHaveBeenCalledWith(
    expect.objectContaining({
      bytes: file.size,
      filename: file.name,
      mode: "replace",
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
    }),
  );
  expect(upload).toHaveBeenCalledWith(
    "owned/request.pdf",
    "file-scoped",
    file,
    { contentType: "application/pdf", upsert: false },
  );
  expect(state.current).toBeNull();
});
it("retries an uncertain commit with the same UUID without another upload or new clinic", async () => {
  const state = attempts();
  vi.mocked(finishClinicSave).mockRejectedValueOnce(new Error("reply lost"));
  await expect(
    saveClinicTemplate(data(), { kind: "replace", file }, undefined, state),
  ).rejects.toThrow("reply lost");
  const id = state.current!.id;
  await saveClinicTemplate(data(), { kind: "replace", file }, undefined, state);
  expect(finishClinicSave).toHaveBeenNthCalledWith(2, id);
  expect(beginClinicSave).toHaveBeenCalledTimes(1);
  expect(upload).toHaveBeenCalledTimes(1);
});
it("checks an uncertain earlier result before applying edited retry values", async () => {
  const state = attempts();
  vi.mocked(finishClinicSave).mockRejectedValueOnce(new Error("lost"));
  await expect(
    saveClinicTemplate(data(), { kind: "keep" }, undefined, state),
  ).rejects.toThrow();
  vi.mocked(cancelClinicSave).mockResolvedValueOnce({
    status: "saved",
    cleanupPending: false,
  });
  expect(
    await saveClinicTemplate(
      data("Edited"),
      { kind: "keep" },
      undefined,
      state,
    ),
  ).toMatchObject({
    status: "failed",
    message: expect.stringContaining("El intento anterior ya se guardó"),
  });
  expect(state.current).not.toBeNull();
  expect(beginClinicSave).toHaveBeenCalledTimes(1);
});
it("cancels an uncertain upload before retrying with a fresh immutable UUID", async () => {
  const state = attempts();
  upload.mockResolvedValueOnce({ error: new Error("upload failed") });
  expect(
    (
      await saveClinicTemplate(
        data(),
        { kind: "replace", file },
        undefined,
        state,
      )
    ).status,
  ).toBe("failed");
  const oldId = state.current!.id;
  await saveClinicTemplate(data(), { kind: "replace", file }, undefined, state);
  expect(cancelClinicSave).toHaveBeenCalledWith(oldId);
  expect(vi.mocked(beginClinicSave).mock.calls[1][0].requestId).not.toBe(oldId);
});
it("keeps a successful operation retryable when only cleanup failed", async () => {
  const state = attempts();
  vi.mocked(finishClinicSave).mockResolvedValueOnce({
    status: "saved",
    cleanupPending: true,
  });
  expect(
    await saveClinicTemplate(data(), { kind: "keep" }, undefined, state),
  ).toEqual({ status: "saved", cleanupPending: true });
  const id = state.current!.id;
  await saveClinicTemplate(data(), { kind: "keep" }, undefined, state);
  expect(finishClinicSave).toHaveBeenNthCalledWith(2, id);
  expect(beginClinicSave).toHaveBeenCalledTimes(1);
});
it("keeps cancellation retry identity until affected-object cleanup succeeds", async () => {
  const state = attempts();
  state.set({ id: "request", signature: "draft", phase: "begin" });
  vi.mocked(cancelClinicSave).mockResolvedValueOnce({
    status: "cancelled",
    cleanupPending: true,
  });
  expect(await cancelTemplateAttempt(state)).toMatchObject({
    cleanupPending: true,
  });
  expect(state.current?.id).toBe("request");
  await cancelTemplateAttempt(state);
  expect(state.current).toBeNull();
});
it("rejects invalid clinic input before reserving or uploading", async () => {
  expect(
    (
      await saveClinicTemplate(
        data(" "),
        { kind: "replace", file },
        undefined,
        attempts(),
      )
    ).status,
  ).toBe("invalid");
  expect(beginClinicSave).not.toHaveBeenCalled();
  expect(upload).not.toHaveBeenCalled();
});
