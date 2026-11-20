import { renderToString } from "react-dom/server";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  sessionMarker,
  sessionMarkerName,
} from "@/lib/supabase/session-context";
import {
  acceptContext,
  invalidateContext,
  sessionFenceKey,
} from "./session-fence";
import { SignedInHistoryGuard, SignedInPage } from "./signed-in-history-guard";
const router = vi.hoisted(() => ({ refresh: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/activity",
  useSearchParams: () => new URLSearchParams(),
}));
const context = {
  generation: "a".repeat(64),
  expiresAt: Math.floor(Date.now() / 1000) + 3600,
  verifiedAt: 100,
};
function response() {
  return new Response(null, {
    status: 204,
    headers: {
      "X-MyClinics-Expires": String(context.expiresAt),
      "X-MyClinics-Verified": "200",
    },
  });
}
function mount(renderContext = context) {
  return render(
    <SignedInHistoryGuard ownerId="owner" context={renderContext}>
      <SignedInPage
        ownerId="owner"
        context={renderContext}
        renderId="original"
        renderedAt={1}
      >
        <main>
          <h1>Private activity</h1>
          <input aria-label="Draft" defaultValue="unsaved" />
        </main>
      </SignedInPage>
    </SignedInHistoryGuard>,
  );
}
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.clear();
  document.cookie = `${sessionMarkerName}=${sessionMarker(context)}; path=/`;
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: false,
  });
  window.history.replaceState({}, "", "/activity");
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  router.refresh.mockReset();
  router.replace.mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("signed-in session continuity", () => {
  it("shows the same draft immediately during a slow return check and deduplicates event bursts", async () => {
    let finish!: (value: Response) => void;
    const fetch = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetch);
    mount();
    act(() => {
      window.dispatchEvent(new Event("blur"));
      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.getByRole("heading")).toBeVisible();
    expect(screen.getByLabelText("Draft")).toHaveValue("unsaved");
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(async () => finish(response()));
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });
  it("preserves a known same-URL history draft without unmounting", async () => {
    vi.stubGlobal("fetch", vi.fn());
    mount();
    const draft = screen.getByLabelText("Draft") as HTMLInputElement;
    draft.value = "edited unsaved value";
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    expect(screen.getByLabelText("Draft")).toBe(draft);
    expect(draft).toHaveValue("edited unsaved value");
    await act(async () => {});
    expect(screen.getByRole("heading")).toBeVisible();
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });
  it("does not reveal a held old verification after same-user re-login and cookie rollback", async () => {
    let finish!: (value: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          }),
      ),
    );
    mount();
    act(() => {
      window.dispatchEvent(new Event("blur"));
      window.dispatchEvent(new Event("focus"));
    });
    act(() => {
      invalidateContext(context.generation);
      acceptContext({
        ...context,
        generation: "b".repeat(64),
        verifiedAt: 300,
      });
      // The browser can apply old Set-Cookie headers even after JS aborts.
      document.cookie = `${sessionMarkerName}=${sessionMarker(context)}; path=/`;
      window.dispatchEvent(
        new StorageEvent("storage", { key: sessionFenceKey }),
      );
    });
    await act(async () => finish(response()));
    expect(screen.queryByText("Private activity")).not.toBeInTheDocument();
  });
  it("blocks expired context and keeps failed verification behind accessible recovery", async () => {
    document.cookie = `${sessionMarkerName}=${sessionMarker({ ...context, expiresAt: 1 })}; path=/`;
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    mount();
    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
    expect(screen.getByText("Private activity")).not.toBeVisible();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeVisible();
  });
});
it("shows exceptional storage recovery without verification/reload loops", async () => {
  localStorage.setItem(sessionFenceKey, "corrupt");
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  mount();
  await waitFor(() =>
    expect(screen.getByText(/No se puede recuperar/)).toBeVisible(),
  );
  act(() => {
    window.dispatchEvent(new Event("focus"));
    window.dispatchEvent(new Event("online"));
  });
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.getByText(/Cierra todas las/)).toBeVisible();
  expect(
    screen.queryByRole("heading", { name: "Private activity" }),
  ).toBeNull();
});

it("does not bootstrap a spent generation after a later account established continuity", async () => {
  acceptContext(context);
  invalidateContext(context.generation);
  acceptContext({ ...context, generation: "b".repeat(64), verifiedAt: 200 });
  // The actual fixed fence must reject even if this old render carries a
  // timestamp later than the newer account's initial verification.
  const newer = { ...context, generation: "b".repeat(64), verifiedAt: 300 };
  acceptContext(newer);
  vi.stubGlobal("fetch", vi.fn());
  mount({ ...context, verifiedAt: 400 });
  await waitFor(() =>
    expect(screen.getByText(/No se puede recuperar/)).toBeVisible(),
  );
  expect(
    screen.queryByRole("heading", { name: "Private activity" }),
  ).toBeNull();
});

it("conceals server-rendered private markup before hydration can accept its generation", () => {
  const html = renderToString(
    <SignedInHistoryGuard ownerId="owner" context={context}>
      <SignedInPage
        ownerId="owner"
        context={context}
        renderId="ssr"
        renderedAt={1}
      >
        <main>
          <h1>Private activity</h1>
        </main>
      </SignedInPage>
    </SignedInHistoryGuard>,
  );
  const container = document.createElement("div");
  container.innerHTML = html;
  const protectedRoot = container
    .querySelector("main")
    ?.closest<HTMLElement>("[inert]");
  expect(protectedRoot).not.toBeNull();
  expect(protectedRoot?.getAttribute("aria-hidden")).toBe("true");
  expect(protectedRoot?.style.opacity).toBe("0");
  expect(protectedRoot?.style.display).not.toBe("none");
  expect(container.textContent).toContain("Comprobando");
});

it("reveals a legitimate cold server-verified context after the client fence accepts it", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  mount();
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Private activity" }),
    ).toBeVisible(),
  );
  expect(fetch).not.toHaveBeenCalled();
});
