import type { Page, Request } from "@playwright/test";
import { appOrigin } from "./config";

type Settlement = "settled" | "unresolved";

export function trackSave(page: Page) {
  const { promise, resolve } = Promise.withResolvers<Settlement>();

  function onRequest(request: Request) {
    const url = new URL(request.url());
    if (
      url.origin !== appOrigin ||
      url.pathname !== "/activity" ||
      request.method() !== "POST" ||
      !request.headers()["next-action"]
    ) {
      return;
    }
    stop();
    void settle(request).then(resolve, () => resolve("unresolved"));
  }

  function stop() {
    page.off("request", onRequest);
  }

  page.on("request", onRequest);
  return { settlement: promise, stop };
}

async function settle(request: Request): Promise<Settlement> {
  const response = await request.response();
  // A complete successful action response follows the server's awaited RPC.
  // A network error, redirect, or error response leaves the write ambiguous.
  if (!response?.ok() || (await response.finished())) return "unresolved";
  return "settled";
}
