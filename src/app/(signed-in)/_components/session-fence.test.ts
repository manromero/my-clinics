import { beforeEach, describe, expect, it } from "vitest";
import {
  acceptContext,
  contextIsCurrent,
  invalidateContext,
  readFence,
} from "./session-fence";
import {
  parseSessionMarker,
  sameSession,
  sessionMarker,
} from "@/lib/supabase/session-context";

const old = {
  generation: "a".repeat(64),
  expiresAt: 9999999999,
  verifiedAt: 100,
};
const next = { ...old, generation: "b".repeat(64), verifiedAt: 200 };
beforeEach(() => localStorage.clear());
describe("session presentation fence", () => {
  it("rejects late old RSC/bootstrap and cookie snapshots after same-user re-login", () => {
    expect(acceptContext(old)).toBe(true);
    invalidateContext(old.generation);
    expect(acceptContext(next)).toBe(true);
    expect(acceptContext(old)).toBe(false);
    expect(contextIsCurrent(old)).toBe(false);
    expect(contextIsCurrent(next)).toBe(true);
    expect(sameSession(next, parseSessionMarker(sessionMarker(old)))).toBe(
      false,
    );
  });
  it("keeps successful sign-out terminal even if an old verification completes", () => {
    acceptContext(old);
    invalidateContext();
    expect(acceptContext({ ...old, verifiedAt: 300 })).toBe(false);
    expect(contextIsCurrent(old)).toBe(false);
  });
  it("fails closed for equal-time conflicting generations", () => {
    acceptContext(next);
    expect(acceptContext({ ...old, verifiedAt: next.verifiedAt })).toBe(false);
    expect(readFence()?.generation).toBe(next.generation);
  });
  it("does not roll back same-generation ordering when a slow earlier request completes", () => {
    acceptContext({ ...old, verifiedAt: 300 });
    acceptContext(old);
    expect(readFence()?.verifiedAt).toBe(300);
    expect(acceptContext(next)).toBe(false);
  });
  it("rejects missing, malformed and expired markers", () => {
    expect(parseSessionMarker(undefined)).toBeNull();
    expect(parseSessionMarker("user-id")).toBeNull();
    expect(sameSession(old, { ...old, expiresAt: 1 })).toBe(false);
  });
});
