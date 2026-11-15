"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/lib/components/button/button";
import { Dialog } from "@/lib/components/dialog/dialog";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { createHistoryScroll } from "./history-scroll";

const accountChannelName = "myclinics-account";
export const ConcealSignedInContent = createContext<() => void>(() => {});
const SignedInOwner = createContext<string | null>(null);

let checkHistory: ((event: PopStateEvent) => void) | undefined;

export function SignedInPage({
  ownerId,
  children,
}: {
  ownerId: string;
  children: ReactNode;
}) {
  const layoutOwner = useContext(SignedInOwner);
  const conceal = useContext(ConcealSignedInContent);
  const sameOwner = layoutOwner === ownerId;

  useLayoutEffect(() => {
    // A fresh page can arrive under a layout retained from a previous account.
    if (!sameOwner) {
      conceal();
      window.location.reload();
    }
  }, [sameOwner, conceal]);

  return sameOwner ? children : null;
}

function openAccountChannel() {
  if (typeof BroadcastChannel !== "undefined") {
    return new BroadcastChannel(accountChannelName);
  }
}

export function notifySignedOut() {
  const channel = openAccountChannel();
  channel?.postMessage("signed-out");
  channel?.close();
}

function isSignedInLocation() {
  return ["/activity", "/clinics", "/summary"].includes(
    window.location.pathname,
  );
}

function verifySignedInHistory(event: PopStateEvent) {
  if (checkHistory) {
    checkHistory(event);
    return;
  }
  if (!isSignedInLocation()) return;

  // A transition to Login can unmount the guard while router history survives.
  // Reload protected entries in that document to authorize them from scratch.
  event.stopImmediatePropagation();
  window.location.reload();
}

export function SignedInHistoryGuard({
  ownerId,
  children,
}: {
  ownerId: string;
  children: ReactNode;
}) {
  const content = useRef<HTMLDivElement>(null);
  const concealed = useRef(false);
  const retry = useRef<() => void>(null);
  const historyScroll = useRef<ReturnType<typeof createHistoryScroll>>(null);
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const committedRoute = useRef({ pathname, search });
  const [state, setState] = useState<
    "visible" | "checking" | "failed" | "concealed"
  >("visible");

  function concealContent() {
    concealed.current = true;
    content.current?.style.setProperty("display", "none");
    setState("concealed");
  }

  useLayoutEffect(() => {
    const root = content.current!;
    const scroll = createHistoryScroll(root);
    historyScroll.current = scroll;
    let check: AbortController | undefined;
    let needsCheck = false;
    let focusedControl: HTMLElement | undefined;
    let historyEntry: { href: string; state: unknown } | undefined;
    let confirmedEvent: PopStateEvent | undefined;

    function hide() {
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && root.contains(focused)) {
        focusedControl = focused;
      }
      root.style.setProperty("display", "none");
    }

    function protectConcealedDialog(event: KeyboardEvent) {
      if (event.key !== "Escape" || root.style.display !== "none") return;

      // Escape can target a concealed native modal behind the retry dialog.
      // Stop the key before the browser requests dismissal of that modal.
      event.preventDefault();
    }

    function suspend() {
      needsCheck = true;
      check?.abort();
      check = undefined;
      hide();
    }

    async function verify() {
      if (check || concealed.current || document.hidden) return;
      // Keep the currently committed screen visible while verifying a
      // traversal. The router has not received the destination entry yet.
      if (needsCheck) {
        hide();
        setState("checking");
      }
      const request = new AbortController();
      check = request;
      try {
        const response = await fetch("/auth/session", {
          cache: "no-store",
          headers: { "X-MyClinics-Owner": ownerId },
          signal: AbortSignal.any([request.signal, AbortSignal.timeout(8000)]),
        });
        if (request.signal.aborted || concealed.current) return;
        if (response.status === 409) {
          concealContent();
          window.location.reload();
          return;
        }
        if (response.status !== 204) throw new Error("Session unavailable");
        needsCheck = false;
        root.style.removeProperty("display");
        setState("visible");
        const entry = historyEntry;
        historyEntry = undefined;
        if (entry?.href === window.location.href) {
          confirmedEvent = new PopStateEvent("popstate", {
            state: entry.state,
          });
          window.dispatchEvent(confirmedEvent);
          confirmedEvent = undefined;
          scroll.restore(
            committedRoute.current.pathname,
            committedRoute.current.search,
          );
        } else {
          scroll.cancel();
        }
        // Restore focus after a possible retry dialog closes.
        const restoreFocus = focusedControl;
        window.requestAnimationFrame(() => {
          restoreFocus?.focus({ preventScroll: true });
        });
        focusedControl = undefined;
      } catch {
        if (!request.signal.aborted && !concealed.current) {
          needsCheck = true;
          hide();
          setState("failed");
        }
      } finally {
        if (check === request) check = undefined;
      }
    }

    function verifyOnReturn() {
      if (needsCheck || historyEntry) void verify();
    }

    function visibilityChanged() {
      if (document.hidden) suspend();
      else verifyOnReturn();
    }

    const channel = openAccountChannel();
    channel?.addEventListener("message", (event) => {
      if (event.data !== "signed-out") return;
      suspend();
      void verify();
    });
    retry.current = () => void verify();

    // Hide the saved document before the browser stores it in its history
    // cache. A restored document must verify the current account again.
    const verifyRestoredSession = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pagehide", suspend);
    window.addEventListener("pageshow", verifyRestoredSession);
    window.addEventListener("blur", suspend);
    window.addEventListener("focus", verifyOnReturn);
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("keydown", protectConcealedDialog, true);
    if (document.hidden) suspend();
    // Keep this listener for the document's lifetime, including after client
    // navigation to Login. Registering the same function again is a no-op.
    const onHistory = (event: PopStateEvent) => {
      if (event === confirmedEvent) return;
      if (!isSignedInLocation()) {
        historyEntry = undefined;
        scroll.cancel();
        return;
      }

      event.stopImmediatePropagation();
      scroll.begin();
      historyEntry = { href: window.location.href, state: event.state };
      check?.abort();
      check = undefined;
      void verify();
    };
    checkHistory = onHistory;
    window.addEventListener("popstate", verifySignedInHistory, true);
    return () => {
      if (checkHistory === onHistory) checkHistory = undefined;
      historyScroll.current = null;
      scroll.dispose();
      check?.abort();
      channel?.close();
      window.removeEventListener("pagehide", suspend);
      window.removeEventListener("pageshow", verifyRestoredSession);
      window.removeEventListener("blur", suspend);
      window.removeEventListener("focus", verifyOnReturn);
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.removeEventListener("keydown", protectConcealedDialog, true);
    };
  }, [ownerId]);

  useLayoutEffect(() => {
    committedRoute.current = { pathname, search };
    historyScroll.current?.restore(pathname, search);
  }, [pathname, search]);

  return (
    <ConcealSignedInContent value={concealContent}>
      {(state === "checking" || state === "concealed") && (
        <PageContainer className="py-8">
          <LoadingState label="Comprobando sesión…" variant="region" />
        </PageContainer>
      )}
      {state === "failed" && (
        <Dialog
          open
          dismissible={false}
          onOpenChange={() => {}}
          size="sm"
          title="No se pudo comprobar la sesión"
          actions={
            <Button onClick={() => retry.current?.()}>Reintentar</Button>
          }
        >
          <p>Vuelve a intentarlo para acceder a tus datos.</p>
        </Dialog>
      )}
      <div ref={content} className="flex min-h-dvh flex-col">
        <SignedInOwner value={ownerId}>
          {state !== "concealed" && children}
        </SignedInOwner>
      </div>
    </ConcealSignedInContent>
  );
}
