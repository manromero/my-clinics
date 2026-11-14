"use client";

import {
  createContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/lib/components/button/button";
import { Dialog } from "@/lib/components/dialog/dialog";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";

const accountChannelName = "myclinics-account";
export const ConcealSignedInContent = createContext<() => void>(() => {});

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

function verifySignedInHistory(event: PopStateEvent) {
  const { pathname } = window.location;
  if (pathname !== "/activity" && pathname !== "/clinics") return;

  // The router can restore a cached signed-in payload without a server request.
  // Intercept before its popstate handler runs and verify the current session.
  event.stopImmediatePropagation();
  document.documentElement.style.visibility = "hidden";
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
  const [state, setState] = useState<
    "visible" | "checking" | "failed" | "concealed"
  >("visible");

  function concealContent() {
    concealed.current = true;
    content.current?.style.setProperty("display", "none");
    setState("concealed");
  }

  useLayoutEffect(() => {
    let check: AbortController | undefined;
    let needsCheck = false;
    let focusedControl: HTMLElement | undefined;

    function hide() {
      const root = content.current;
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && root?.contains(focused)) {
        focusedControl = focused;
      }
      root?.style.setProperty("display", "none");
    }

    function suspend() {
      needsCheck = true;
      check?.abort();
      check = undefined;
      hide();
    }

    async function verify() {
      if (check || concealed.current || document.hidden) return;
      hide();
      setState("checking");
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
        content.current?.style.removeProperty("display");
        setState("visible");
        // Restore focus after a possible retry dialog closes.
        const restoreFocus = focusedControl;
        window.requestAnimationFrame(() => {
          restoreFocus?.focus({ preventScroll: true });
        });
        focusedControl = undefined;
      } catch {
        if (!request.signal.aborted && !concealed.current) setState("failed");
      } finally {
        if (check === request) check = undefined;
      }
    }

    function verifyOnReturn() {
      if (needsCheck) void verify();
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
    if (document.hidden) suspend();
    // Keep this listener for the document's lifetime, including after client
    // navigation to Login. Registering the same function again is a no-op.
    window.addEventListener("popstate", verifySignedInHistory, true);
    return () => {
      check?.abort();
      channel?.close();
      window.removeEventListener("pagehide", suspend);
      window.removeEventListener("pageshow", verifyRestoredSession);
      window.removeEventListener("blur", suspend);
      window.removeEventListener("focus", verifyOnReturn);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, [ownerId]);

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
        {state !== "concealed" && children}
      </div>
    </ConcealSignedInContent>
  );
}
