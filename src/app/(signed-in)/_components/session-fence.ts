"use client";

import type { SessionContext } from "@/lib/supabase/session-context";

const key = "myclinics-session-context";
const retiredLimit = 256;
type Fence = SessionContext & {
  invalidated?: boolean;
  retired: string[];
  blocked?: boolean;
};
const generationPattern = /^[a-f0-9]{64}$/;

// undefined means unavailable/corrupt storage, distinct from a first visit.
function storedFence(): Fence | null | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const value = JSON.parse(raw) as Partial<Fence>;
    if (
      !value ||
      typeof value.generation !== "string" ||
      !generationPattern.test(value.generation) ||
      !Number.isSafeInteger(value.verifiedAt) ||
      !Number.isSafeInteger(value.expiresAt)
    )
      return undefined;
    const retired = value.retired ?? [];
    if (
      !Array.isArray(retired) ||
      retired.length > retiredLimit ||
      retired.some(
        (id) => typeof id !== "string" || !generationPattern.test(id),
      )
    )
      return undefined;
    return { ...value, retired } as Fence;
  } catch {
    return undefined;
  }
}

export function readFence(): Fence | null {
  return storedFence() ?? null;
}

export function acceptContext(context: SessionContext) {
  const previous = storedFence();
  if (
    previous === undefined ||
    previous?.blocked ||
    previous?.retired.includes(context.generation)
  )
    return false;
  if (previous?.generation === context.generation && previous.invalidated)
    return false;
  // Ordering only rejects stale bootstrap snapshots. A newer timestamp never
  // revives a generation that was signed out or superseded.
  if (
    previous &&
    previous.generation !== context.generation &&
    previous.verifiedAt >= context.verifiedAt
  )
    return false;
  if (
    previous?.generation === context.generation &&
    previous.verifiedAt > context.verifiedAt
  )
    return true;
  const retired = previous ? [...previous.retired] : [];
  if (
    previous &&
    previous.generation !== context.generation &&
    !retired.includes(previous.generation)
  )
    retired.push(previous.generation);
  try {
    if (retired.length > retiredLimit) {
      // Keep the already-established context usable; never evict a spent ID
      // to admit another one. The caller presents explicit storage recovery.
      return false;
    }
    localStorage.setItem(key, JSON.stringify({ ...context, retired }));
    return true;
  } catch {
    return false;
  }
}

export function invalidateContext(generation?: string) {
  const previous = storedFence();
  if (!previous || (generation && previous.generation !== generation)) return;
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ ...previous, invalidated: true }),
    );
  } catch {
    /* The active guard still conceals locally. */
  }
}

export function contextIsCurrent(context: SessionContext) {
  const value = storedFence();
  return (
    value?.generation === context.generation &&
    !value.invalidated &&
    !value.blocked &&
    !value.retired.includes(context.generation)
  );
}

export const sessionFenceKey = key;
