"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { Alert } from "@/lib/components/alert/alert";
import { Button } from "@/lib/components/button/button";
import { Dialog } from "@/lib/components/dialog/dialog";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { createHistoryScroll } from "./history-scroll";

const accountChannelName = "myclinics-account";
export const ConcealSignedInContent = createContext<() => void>(() => {});
const SignedInOwner = createContext<string | null>(null);
type HistoryStatus = "loading" | "slow" | "retrying";
type HistoryTraversal = {
  href: string;
  firstRender?: { id: string; refreshStarted: boolean };
  timeout?: number;
  restoreFocus?: boolean;
};
const HistoryRestore = createContext<{
  attempt: symbol | null;
  status: HistoryStatus;
  pageRendered: (href: string, renderId: string) => void;
  retry: () => void;
} | null>(null);

let beginHistoryRestore: (() => void) | undefined;

function routeHref(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname;
}

function currentHistoryHref() {
  const { pathname, searchParams } = new URL(window.location.href);
  return routeHref(pathname, searchParams.toString());
}

export function SignedInPage({
  ownerId,
  renderId,
  children,
}: {
  ownerId: string;
  renderId: string;
  children: ReactNode;
}) {
  const layoutOwner = useContext(SignedInOwner);
  const conceal = useContext(ConcealSignedInContent);
  const sameOwner = layoutOwner === ownerId;
  const history = useContext(HistoryRestore);
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useLayoutEffect(() => {
    // A fresh page can arrive under a layout retained from a previous account.
    if (!sameOwner) {
      conceal();
      window.location.reload();
    } else if (history?.attempt) {
      history.pageRendered(routeHref(pathname, search), renderId);
    }
  }, [sameOwner, conceal, history, pathname, search, renderId]);

  if (!sameOwner) return null;
  if (!history?.attempt) return children;
  return (
    <PageContainer as="main" className="flex-1">
      {history.status === "loading" ? (
        <LoadingState label="Cargando página…" variant="region" />
      ) : (
        <Alert
          data-history-recovery
          title="La página está tardando en cargar"
          announcement="polite"
          action={{
            label:
              history.status === "retrying" ? "Cargando página…" : "Reintentar",
            onClick: history.retry,
            pending: history.status === "retrying",
          }}
        >
          Puedes esperar o volver a intentarlo.
        </Alert>
      )}
    </PageContainer>
  );
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
  if (!isSignedInLocation()) return;
  if (beginHistoryRestore) {
    beginHistoryRestore();
    return;
  }

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
  const { refresh, replace } = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const traversal = useRef<HistoryTraversal | null>(null);
  const [attempt, setAttempt] = useState<symbol | null>(null);
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>("loading");
  const [refreshing, startRefresh] = useTransition();
  const [state, setState] = useState<
    "visible" | "checking" | "failed" | "concealed"
  >("visible");

  const concealContent = useCallback(() => {
    concealed.current = true;
    content.current?.style.setProperty("display", "none");
    setState("concealed");
  }, []);

  const watchHistory = useCallback((pending: HistoryTraversal) => {
    window.clearTimeout(pending.timeout);
    pending.timeout = window.setTimeout(() => {
      if (traversal.current === pending && !concealed.current)
        setHistoryStatus("slow");
    }, 8000);
  }, []);

  const retryHistory = useCallback(() => {
    const pending = traversal.current;
    if (!pending || concealed.current || pending.href !== currentHistoryHref())
      return;

    pending.restoreFocus ||= Boolean(
      document.activeElement?.closest("[data-history-recovery]"),
    );
    setHistoryStatus("retrying");
    watchHistory(pending);
    if (pending.firstRender) {
      startRefresh(refresh);
    } else {
      const { pathname, search, hash } = window.location;
      replace(`${pathname}${search}${hash}`, { scroll: false });
    }
  }, [refresh, replace, watchHistory]);

  const pageRendered = useCallback(
    (href: string, renderId: string) => {
      const pending = traversal.current;
      if (!pending || href !== currentHistoryHref() || concealed.current)
        return;

      if (href !== pending.href || !pending.firstRender) {
        const firstRender = { id: renderId, refreshStarted: false };
        pending.href = href;
        pending.firstRender = firstRender;
        // The first commit may come from the router cache. Its data stays
        // behind the gate while the destination authorizes a fresh render.
        queueMicrotask(() => {
          if (
            traversal.current !== pending ||
            pending.firstRender !== firstRender ||
            concealed.current
          )
            return;
          firstRender.refreshStarted = true;
          startRefresh(refresh);
        });
      } else if (
        pending.firstRender.refreshStarted &&
        !refreshing &&
        renderId !== pending.firstRender.id
      ) {
        const restoreFocus =
          pending.restoreFocus ||
          document.activeElement?.closest("[data-history-recovery]");
        window.clearTimeout(pending.timeout);
        traversal.current = null;
        setAttempt(null);
        if (restoreFocus) {
          window.requestAnimationFrame(() => {
            if (
              !traversal.current &&
              document.activeElement === document.body
            ) {
              content.current
                ?.querySelector<HTMLElement>(
                  'header nav a[aria-current="page"]',
                )
                ?.focus({ preventScroll: true });
            }
          });
        }
      }
    },
    [refresh, refreshing],
  );

  useLayoutEffect(() => {
    const root = content.current!;
    const scroll = createHistoryScroll(root);
    historyScroll.current = scroll;
    let check: AbortController | undefined;
    let needsCheck = false;
    let focusedControl: HTMLElement | undefined;

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
        root.style.removeProperty("display");
        setState("visible");
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
    window.addEventListener("keydown", protectConcealedDialog, true);
    if (document.hidden) suspend();
    // Keep this listener for the document's lifetime, including after client
    // navigation to Login. Registering the same function again is a no-op.
    const onHistory = () => {
      window.clearTimeout(traversal.current?.timeout);
      scroll.begin();
      const pending = { href: currentHistoryHref() };
      traversal.current = pending;
      watchHistory(pending);
      // Close the gate before Next receives this native history event.
      flushSync(() => {
        setHistoryStatus("loading");
        setAttempt(Symbol());
      });
    };
    beginHistoryRestore = onHistory;
    window.addEventListener("popstate", verifySignedInHistory, true);
    return () => {
      if (beginHistoryRestore === onHistory) beginHistoryRestore = undefined;
      window.clearTimeout(traversal.current?.timeout);
      traversal.current = null;
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
  }, [concealContent, ownerId, watchHistory]);

  useLayoutEffect(() => {
    if (!attempt) historyScroll.current?.restore(pathname, search);
  }, [attempt, pathname, search]);

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
          <HistoryRestore
            value={{
              attempt,
              status: historyStatus,
              pageRendered,
              retry: retryHistory,
            }}
          >
            {state !== "concealed" && children}
          </HistoryRestore>
        </SignedInOwner>
      </div>
    </ConcealSignedInContent>
  );
}
