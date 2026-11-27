// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const parser = vi.hoisted(() => vi.fn());
vi.mock("./pdf-validation", () => ({
  templateByteLimit: 10000000,
  validateTemplatePdf: parser,
}));
import { templateInfrastructure } from "./infrastructure";

const ownerId = "00000000-0000-4000-8000-000000000001";
const requestId = "00000000-0000-4000-8000-000000000002";
function fixture() {
  const row = {
    id: requestId,
    owner_id: ownerId,
    mode: "replace",
    state: "pending",
    lease_id: requestId,
    expected_sha256: "verified",
    expected_bytes: 3,
    outcome: null as unknown,
  };
  const events: string[] = [];
  const outcome = {
    clinicId: "1",
    templateId: requestId,
    retiredTemplateId: requestId,
    revision: "2",
  };
  const rpc = vi.fn((name: string, args: Record<string, unknown>) => ({
    abortSignal: async () => {
      expect(args.p_id).toBe(requestId);
      events.push(name);
      if (name === "cancel_template_save") {
        row.state = "cancelled";
      }
      if (name === "commit_template_save") {
        return { data: outcome, error: null };
      }
      return { data: row, error: null };
    },
  }));
  const fetcher = vi.fn(async (_input: unknown, init?: RequestInit) => {
    events.push(init?.method ?? "GET");
    if (init?.method === "DELETE") {
      return new Response("[]");
    }
    if (init?.method === "POST") return new Response("[]");
    return new Response(new Uint8Array([1, 2, 3]));
  });
  vi.stubGlobal("fetch", fetcher);
  const auth = {
    auth: {
      getUser: async () => ({ data: { user: { id: ownerId } }, error: null }),
    },
  };
  const templates = templateInfrastructure(
    auth as never,
    { rpc } as never,
    "https://example.test",
    "private-test-credential",
  );
  return { row, rpc, events, outcome, fetcher, templates };
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
describe("template lifecycle recovery", () => {
  it("validates the stored bytes without another Storage upload", async () => {
    const f = fixture();
    parser.mockResolvedValue({
      valid: true,
      sha256: "verified",
      bytes: 3,
      validator: "test",
    });
    await f.templates.validate(requestId);
    expect(parser).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
    expect(f.fetcher).toHaveBeenCalledTimes(1);
    expect(f.events).toContain("finish_template_validation");
  });
  it("makes Cancel terminal before deleting its bytes", async () => {
    const f = fixture();
    await f.templates.cancel(requestId);
    expect(f.events.indexOf("cancel_template_save")).toBeLessThan(
      f.events.indexOf("claim_template_cleanup"),
    );
    expect(f.events.indexOf("claim_template_cleanup")).toBeLessThan(
      f.events.indexOf("DELETE"),
    );
  });
  it("does not try to delete a file for a cancelled no-upload operation", async () => {
    const f = fixture();
    f.row.mode = "keep";
    expect((await f.templates.cancel(requestId)).cleanupPending).toBe(false);
    expect(f.events).not.toContain("claim_template_cleanup");
    expect(f.fetcher).not.toHaveBeenCalled();
  });
  it("returns the saved outcome and retries its affected deletion when Cancel arrives after Save", async () => {
    const f = fixture();
    f.rpc.mockImplementationOnce(() => ({
      abortSignal: async () => ({
        data: { ...f.row, state: "saved", outcome: f.outcome },
        error: null,
      }),
    }));
    expect(await f.templates.cancel(requestId)).toEqual({
      state: "saved",
      outcome: { ...f.outcome, cleanupPending: false },
      cleanupPending: false,
    });
    expect(f.events).toContain("claim_template_cleanup");
  });
  it("reports successful Save despite deletion failure and retries only that deletion with the same request", async () => {
    const f = fixture();
    f.fetcher.mockImplementationOnce(
      async () => new Response("unavailable", { status: 503 }),
    );
    f.fetcher.mockImplementationOnce(
      async () => new Response("unavailable", { status: 503 }),
    );
    expect(await f.templates.commit(requestId)).toEqual({
      ...f.outcome,
      cleanupPending: true,
    });
    expect(await f.templates.commit(requestId)).toEqual({
      ...f.outcome,
      cleanupPending: false,
    });
    expect(f.events.filter((e) => e === "claim_template_cleanup")).toHaveLength(
      3,
    );
    expect(f.rpc.mock.calls.every(([, args]) => args?.p_id === requestId)).toBe(
      true,
    );
    expect(f.events).not.toContain("list_template_cleanup");
  });
  it("cancels and deletes invalid stored PDFs rather than publishing", async () => {
    const f = fixture();
    parser.mockResolvedValue({ valid: false, reason: "missing-fields" });
    expect(await f.templates.validate(requestId)).toEqual({
      valid: false,
      reason: "missing-fields",
      cleanupPending: false,
    });
    expect(f.events).toContain("cancel_template_save");
    expect(f.events).toContain("DELETE");
    expect(f.events).not.toContain("finish_template_validation");
  });
});
