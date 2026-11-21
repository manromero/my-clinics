import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
afterEach(() => vi.restoreAllMocks());
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

it("never revives an invalidated generation with a newer verification timestamp after multiple transitions", () => {
  expect(acceptContext(old)).toBe(true);
  invalidateContext(old.generation);
  expect(acceptContext(next)).toBe(true);
  expect(acceptContext({ ...old, verifiedAt: 300 })).toBe(false);
  expect(contextIsCurrent(old)).toBe(false);
  const third = { ...old, generation: "c".repeat(64), verifiedAt: 400 };
  expect(acceptContext(third)).toBe(true);
  expect(acceptContext({ ...next, verifiedAt: 500 })).toBe(false);
  expect(acceptContext({ ...old, verifiedAt: 600 })).toBe(false);
  expect(contextIsCurrent(third)).toBe(true);
});

it("fails closed when the bounded retired journal is full instead of forgetting spent generations", () => {
  for (let i = 1; i <= 257; i++)
    expect(
      acceptContext({
        ...old,
        generation: i.toString(16).padStart(64, "0"),
        verifiedAt: i,
      }),
    ).toBe(true);
  expect(readFence()?.retired).toHaveLength(256);
  expect(
    acceptContext({ ...old, generation: "f".repeat(64), verifiedAt: 1000 }),
  ).toBe(false);
  expect(readFence()?.retired).toHaveLength(256);
  expect(
    acceptContext({
      ...old,
      generation: "1".padStart(64, "0"),
      verifiedAt: 2000,
    }),
  ).toBe(false);
  expect(
    contextIsCurrent({
      ...old,
      generation: (257).toString(16).padStart(64, "0"),
    }),
  ).toBe(true);
});

it("fails closed for corrupt or unavailable durable fencing", () => {
  localStorage.setItem("myclinics-session-context", "not-json");
  expect(acceptContext(old)).toBe(false);
  localStorage.clear();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("storage unavailable");
  });
  expect(acceptContext(old)).toBe(false);
  expect(contextIsCurrent(old)).toBe(false);
});
