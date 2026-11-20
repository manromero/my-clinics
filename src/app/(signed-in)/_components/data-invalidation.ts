"use client";

import { readFence } from "./session-fence";
export const dataRevisionKey = "myclinics-data-revision";
export function notifyDataChanged() {
  const generation = readFence()?.generation;
  if (!generation) return;
  try {
    localStorage.setItem(
      dataRevisionKey,
      JSON.stringify({ generation, revision: crypto.randomUUID() }),
    );
  } catch {
    /* Server Actions still invalidate native caches in this tab. */
  }
  window.dispatchEvent(new Event(dataRevisionKey));
}
export function dataRevision() {
  try {
    const value = JSON.parse(localStorage.getItem(dataRevisionKey) ?? "null");
    return value?.generation === readFence()?.generation
      ? String(value.revision)
      : "";
  } catch {
    return "";
  }
}
