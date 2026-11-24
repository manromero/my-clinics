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
const router = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
  pathname: "/activity",
}));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => router.pathname,
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
  router.pathname = "/activity";
  router.refresh.mockReset();
  router.replace.mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("signed-in session continuity", () => {
  it("keeps a visible document and its edited draft rendered between blur and focus", async () => {
    const fetch = vi.fn().mockResolvedValue(response());
    vi.stubGlobal("fetch", fetch);
    mount();
    await waitFor(() => expect(screen.getByRole("heading")).toBeVisible());
    const draft = screen.getByLabelText("Draft") as HTMLInputElement;
    draft.value = "edited while working side by side";
    draft.focus();
    vi.mocked(window.scrollTo).mockClear();
    act(() => window.dispatchEvent(new Event("blur")));
    expect(document.hidden).toBe(false);
    expect(screen.getByRole("heading")).toBeVisible();
    expect(draft).toBeVisible();
    expect(draft).toHaveValue("edited while working side by side");
    expect(fetch).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(screen.getByLabelText("Draft")).toBe(draft);
    expect(draft).toBeVisible();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
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
  it("keeps an established session rendered across ordinary visibility changes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));
    mount();
    await waitFor(() => expect(screen.getByRole("heading")).toBeVisible());
    act(() => {
      Object.defineProperty(document, "hidden", { value: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByRole("heading")).toBeVisible();
    await act(async () => {
      Object.defineProperty(document, "hidden", { value: false });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByRole("heading")).toBeVisible();
  });
  it.each(["pagehide", "freeze"])(
    "still conceals private content on %s and verifies its return",
    async (event) => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));
      mount();
      await waitFor(() => expect(screen.getByRole("heading")).toBeVisible());
      const draft = screen.getByLabelText("Draft");
      act(() => {
        (event === "pagehide" ? window : document).dispatchEvent(
          new Event(event),
        );
      });
      expect(draft).not.toBeVisible();
      await act(async () => {
        Object.defineProperty(document, "hidden", { value: false });
        window.dispatchEvent(new Event("focus"));
      });
      expect(draft).toBeVisible();
      expect(screen.getByLabelText("Draft")).toBe(draft);
    },
  );
  it("keeps eligible drafts usable after background network failure and retries without blocking", async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error("offline"));
    vi.stubGlobal("fetch", fetch);
    mount();
    await waitFor(() => expect(screen.getByRole("heading")).toBeVisible());
    const draft = screen.getByLabelText("Draft");
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(screen.getByRole("heading")).toBeVisible();
    expect(draft).toBeVisible();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText(/Puedes seguir trabajando/)).toBeVisible();
    fetch.mockResolvedValueOnce(response());
    await act(async () =>
      screen.getByRole("button", { name: "Reintentar" }).click(),
    );
    expect(screen.queryByText(/Puedes seguir trabajando/)).toBeNull();
    expect(screen.getByLabelText("Draft")).toBe(draft);
  });
  it("blocks a failed background request if its session expired while pending", async () => {
    let fail!: (error: Error) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((_, reject) => {
            fail = reject;
          }),
      ),
    );
    mount();
    await waitFor(() => expect(screen.getByRole("heading")).toBeVisible());
    act(() => window.dispatchEvent(new Event("focus")));
    document.cookie = `${sessionMarkerName}=${sessionMarker({ ...context, expiresAt: 1 })}; path=/`;
    await act(async () => fail(new Error("offline")));
    expect(screen.getByText("Private activity")).not.toBeVisible();
    expect(screen.getByRole("dialog")).toBeVisible();
  });
  it("removes private content on cross-tab sign-out while the window is unfocused", async () => {
    const channels: EventTarget[] = [];
    vi.stubGlobal(
      "BroadcastChannel",
      class extends EventTarget {
        constructor() {
          super();
          channels.push(this);
        }
        close() {}
      },
    );
    mount();
    await waitFor(() => expect(screen.getByRole("heading")).toBeVisible());
    act(() => window.dispatchEvent(new Event("blur")));
    act(() =>
      channels[0].dispatchEvent(
        new MessageEvent("message", { data: "signed-out" }),
      ),
    );
    expect(screen.queryByText("Private activity")).toBeNull();
    expect(screen.queryByLabelText("Draft")).toBeNull();
  });
  it("still conceals an unfocused visible document when its session expires", async () => {
    const expiring = {
      ...context,
      expiresAt: Math.floor(Date.now() / 1000) + 10,
    };
    document.cookie = `${sessionMarkerName}=${sessionMarker(expiring)}; path=/`;
    const fetch = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetch);
    vi.useFakeTimers();
    try {
      mount(expiring);
      await act(async () => {});
      act(() => window.dispatchEvent(new Event("blur")));
      expect(screen.getByRole("heading")).toBeVisible();
      await act(async () => vi.advanceTimersByTime(10_000));
      expect(screen.getByText("Private activity")).not.toBeVisible();
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
  it.each([
    { fresh: true, changedData: false, refreshes: 0 },
    { fresh: false, changedData: false, refreshes: 1 },
    { fresh: true, changedData: true, refreshes: 1 },
  ])(
    "deduplicates only fresh destinations without a later data revision ($fresh/$changedData)",
    async ({ fresh, changedData, refreshes }) => {
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
      const view = mount();
      act(() => {
        window.dispatchEvent(new Event("blur"));
        window.dispatchEvent(new Event("focus"));
      });
      act(() => {
        window.history.pushState({}, "", "/summary");
        router.pathname = "/summary";
      });
      view.rerender(
        <SignedInHistoryGuard ownerId="owner" context={context}>
          <SignedInPage
            ownerId="owner"
            context={context}
            renderId="destination"
            renderedAt={fresh ? Date.now() : 1}
          >
            <main>
              <h1>Private summary</h1>
            </main>
          </SignedInPage>
        </SignedInHistoryGuard>,
      );
      if (changedData)
        localStorage.setItem(
          "myclinics-data-revision",
          JSON.stringify({
            generation: context.generation,
            revision: "changed-during-navigation",
          }),
        );
      await act(async () => finish(response()));
      expect(screen.getByText("Private summary")).toBeVisible();
      expect(router.refresh).toHaveBeenCalledTimes(refreshes);
    },
  );

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
  expect(protectedRoot?.style.visibility).toBe("hidden");
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
