"use client";

import type { SessionContext } from "@/lib/supabase/session-context";

const key = "myclinics-session-context";
type Fence = SessionContext & { invalidated?: boolean };

export function readFence(): Fence | null {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) ?? "null",
    ) as Fence | null;
    return value &&
      typeof value.generation === "string" &&
      typeof value.verifiedAt === "number"
      ? value
      : null;
  } catch {
    return null;
  }
}

export function acceptContext(context: SessionContext) {
  const previous = readFence();
  if (previous?.generation === context.generation && previous.invalidated)
    return false;
  // A delayed old render must not replace a context established by a newer
  // server verification. Equal-time conflicting generations fail closed.
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
  try {
    localStorage.setItem(key, JSON.stringify(context));
    return true;
  } catch {
    return false;
  }
}

export function invalidateContext(generation?: string) {
  const previous = readFence();
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
  const value = readFence();
  return value?.generation === context.generation && !value.invalidated;
}

export const sessionFenceKey = key;
