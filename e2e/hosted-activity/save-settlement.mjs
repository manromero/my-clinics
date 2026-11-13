import { setTimeout, clearTimeout } from "node:timers";

export function waitForSettlement(settlement, timeoutMs) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve("unresolved"), timeoutMs);
    settlement.then(
      (status) => {
        clearTimeout(timer);
        resolve(status);
      },
      () => {
        clearTimeout(timer);
        resolve("unresolved");
      },
    );
  });
}

export async function settleAndClean(
  settlement,
  timeoutMs,
  { confirmSave, removeRows },
) {
  const submission = await waitForSettlement(settlement, timeoutMs);
  const acknowledged = submission === "settled" && (await confirmSave());
  const removed = await removeRows();
  return {
    submission,
    acknowledged,
    removed,
    cleanup: acknowledged && removed === 1 ? "verified" : "unresolved",
  };
}
