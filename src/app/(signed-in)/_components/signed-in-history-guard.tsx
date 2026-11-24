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
import {
  parseSessionMarker,
  sameSession,
  sessionMarkerName,
  type SessionContext,
} from "@/lib/supabase/session-context";
import {
  acceptContext,
  contextIsCurrent,
  invalidateContext,
  sessionFenceKey,
  readFence,
} from "./session-fence";
import { dataRevision, dataRevisionKey } from "./data-invalidation";
import { ContinuityDrafts, type DraftStore } from "./continuity-drafts";
import { createHistoryScroll } from "./history-scroll";

const accountChannelName = "myclinics-account";
export const ConcealSignedInContent = createContext<() => void>(() => {});
export const PrefetchSignedInDestinations = createContext(false);
const SignedInOwner = createContext<{
  ownerId: string;
  context: SessionContext;
} | null>(null);
type HistoryStatus = "loading" | "slow" | "retrying";
type HistoryTraversal = {
  href: string;
  startedAt: number;
  firstRender?: string;
  timeout?: number;
};
const HistoryRestore = createContext<{
  attempt: symbol | null;
  status: HistoryStatus;
  pageRendered: (href: string, renderId: string, renderedAt: number) => void;
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
function marker() {
  return parseSessionMarker(
    document.cookie
      .split("; ")
      .find((value) => value.startsWith(`${sessionMarkerName}=`))
      ?.slice(sessionMarkerName.length + 1),
  );
}

export function SignedInPage({
  ownerId,
  context,
  renderId,
  renderedAt,
  children,
}: {
  ownerId: string;
  context: SessionContext;
  renderId: string;
  renderedAt: number;
  children: ReactNode;
}) {
  const layout = useContext(SignedInOwner);
  const conceal = useContext(ConcealSignedInContent);
  const sameOwner =
    layout?.ownerId === ownerId &&
    layout.context.generation === context.generation;
  const history = useContext(HistoryRestore);
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useLayoutEffect(() => {
    if (!sameOwner) {
      conceal();
      window.location.reload();
    } else
      history?.pageRendered(routeHref(pathname, search), renderId, renderedAt);
  }, [sameOwner, conceal, history, pathname, search, renderId, renderedAt]);
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
  if (typeof BroadcastChannel !== "undefined")
    return new BroadcastChannel(accountChannelName);
}
export function notifySignedOut() {
  invalidateContext();
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
  if (beginHistoryRestore) return beginHistoryRestore();
  event.stopImmediatePropagation();
  window.location.reload();
}

export function SignedInHistoryGuard({
  ownerId,
  context,
  children,
}: {
  ownerId: string;
  context: SessionContext;
  children: ReactNode;
}) {
  const [drafts] = useState<DraftStore>(() => new Map());
  const content = useRef<HTMLDivElement>(null);
  const concealed = useRef(false);
  const presentationBlocked = useRef(true);
  const [sessionNotice, setSessionNotice] = useState(false);
  const retry = useRef<() => void>(null);
  const historyScroll = useRef<ReturnType<typeof createHistoryScroll>>(null);
  const entries = useRef(new Map<string, string>());
  const session = useRef(context);
  const { refresh, replace } = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const traversal = useRef<HistoryTraversal | null>(null);
  const [attempt, setAttempt] = useState<symbol | null>(null);
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>("loading");
  const [refreshing, startRefresh] = useTransition();
  const dataRefreshActive = useRef(false);
  const refreshKnownChanges = useRef<() => void>(null);
  useLayoutEffect(() => {
    dataRefreshActive.current = refreshing;
    if (!refreshing) refreshKnownChanges.current?.();
  });
  // Server authorization cannot inspect the browser's retired-generation fence.
  // Keep its private subtree unpainted until client activation accepts it.
  const [state, setState] = useState<
    "visible" | "checking" | "failed" | "concealed" | "context-failed"
  >("checking");

  const concealContent = useCallback(() => {
    concealed.current = true;
    invalidateContext(context.generation);
    entries.current.clear();
    drafts.clear();
    presentationBlocked.current = true;
    setState("concealed");
  }, [context.generation, drafts]);
  const eligible = useCallback(
    () =>
      !concealed.current &&
      contextIsCurrent(session.current) &&
      sameSession(session.current, marker()),
    [],
  );
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
    setHistoryStatus("retrying");
    watchHistory(pending);
    if (pending.firstRender) startRefresh(refresh);
    else
      replace(
        `${window.location.pathname}${window.location.search}${window.location.hash}`,
        { scroll: false },
      );
  }, [refresh, replace, watchHistory]);
  const pageRendered = useCallback(
    (href: string, renderId: string, renderedAt: number) => {
      if (href !== currentHistoryHref() || concealed.current) return;
      const pending = traversal.current;
      const cached = entries.current.get(href) === renderId;
      if (pending) {
        // Reuse a known native Router Cache entry. A newly authorized server
        // commit also needs no second render. Unknown old entries refresh once.
        if (!cached && renderedAt < pending.startedAt && !pending.firstRender) {
          pending.firstRender = renderId;
          queueMicrotask(() => {
            if (traversal.current === pending && !concealed.current)
              startRefresh(refresh);
          });
          return;
        }
        if (pending.firstRender === renderId) return;
        if (cached && renderedAt < pending.startedAt) {
          queueMicrotask(() => {
            if (
              !concealed.current &&
              href === currentHistoryHref() &&
              !dataRefreshActive.current
            ) {
              dataRefreshActive.current = true;
              startRefresh(refresh);
            }
          });
        }
        window.clearTimeout(pending.timeout);
        traversal.current = null;
        setAttempt(null);
      }
      entries.current.delete(href);
      entries.current.set(href, renderId);
      // This bounds eligibility metadata; private RSC payloads remain managed
      // by Next's native in-memory cache. Entries expire with the session.
      if (entries.current.size > 32)
        entries.current.delete(entries.current.keys().next().value!);
    },
    [refresh],
  );

  useLayoutEffect(() => {
    const root = content.current!;
    const scroll = createHistoryScroll(root);
    historyScroll.current = scroll;
    let check: AbortController | undefined;
    let expiry: number | undefined;
    let uncertainDocument = false;
    let redirecting = false;
    let permanentlyBlocked = false;
    let revision = dataRevision();
    let pendingDataChange = false;
    let focusedControl: HTMLElement | undefined;
    function refreshChangedData() {
      if (
        !pendingDataChange ||
        dataRefreshActive.current ||
        document.hidden ||
        uncertainDocument ||
        presentationBlocked.current ||
        !eligible()
      )
        return;
      pendingDataChange = false;
      dataRefreshActive.current = true;
      startRefresh(refresh);
    }
    function observeDataChange() {
      const next = dataRevision();
      if (next && next !== revision) {
        revision = next;
        pendingDataChange = true;
        entries.current.clear();
      }
      refreshChangedData();
    }
    refreshKnownChanges.current = refreshChangedData;
    function hide() {
      const active = document.activeElement;
      if (active instanceof HTMLElement && root.contains(active))
        focusedControl = active;
      presentationBlocked.current = true;
      setState("checking");
    }
    function reveal() {
      if (concealed.current || permanentlyBlocked || document.hidden) return;
      presentationBlocked.current = false;
      setState("visible");
      const focus = focusedControl;
      focusedControl = undefined;
      window.requestAnimationFrame(() => {
        if (document.activeElement === document.body)
          focus?.focus({ preventScroll: true });
      });
    }
    function expire() {
      window.clearTimeout(expiry);
      expiry = window.setTimeout(
        () => {
          if (concealed.current) return;
          hide();
          entries.current.clear();
          setState("checking");
          void verify(true);
        },
        Math.max(
          0,
          Math.min(session.current.expiresAt * 1000 - Date.now(), 2147483647),
        ),
      );
    }
    async function verify(block = false) {
      if (check || concealed.current || document.hidden) return;
      if (block) {
        hide();
        setState("checking");
      }
      const request = new AbortController();
      check = request;
      const snapshot = session.current;
      try {
        const response = await fetch("/auth/session", {
          cache: "no-store",
          headers: {
            "X-MyClinics-Owner": ownerId,
            "X-MyClinics-Session": snapshot.generation,
          },
          signal: AbortSignal.any([request.signal, AbortSignal.timeout(8000)]),
        });
        if (request.signal.aborted || concealed.current) return;
        if (!contextIsCurrent(snapshot)) {
          hide();
          if (!readFence()) {
            permanentlyBlocked = true;
            setState("context-failed");
          } else {
            concealContent();
            if (!document.hidden && !redirecting) {
              redirecting = true;
              window.location.reload();
            }
          }
          return;
        }
        if (response.status === 409) {
          concealContent();
          window.location.reload();
          return;
        }
        if (response.status !== 204) throw new Error("Session unavailable");
        const renewed = {
          ...snapshot,
          expiresAt: Number(response.headers.get("X-MyClinics-Expires")),
          verifiedAt: Number(response.headers.get("X-MyClinics-Verified")),
        };
        if (
          !sameSession(renewed, marker()) ||
          !Number.isFinite(renewed.verifiedAt) ||
          !acceptContext(renewed)
        ) {
          concealContent();
          return;
        }
        session.current = renewed;
        uncertainDocument = false;
        setSessionNotice(false);
        expire();
        reveal();
        observeDataChange();
      } catch {
        if (!request.signal.aborted && !concealed.current) {
          if (eligible() && !uncertainDocument) {
            setSessionNotice(true);
          } else {
            hide();
            setState("failed");
          }
        }
      } finally {
        if (check === request) check = undefined;
      }
    }
    function returned() {
      if (document.hidden || permanentlyBlocked) return;
      if (!readFence()) {
        permanentlyBlocked = true;
        hide();
        entries.current.clear();
        drafts.clear();
        setState("context-failed");
        return;
      }
      if (concealed.current) {
        if (!redirecting) {
          redirecting = true;
          window.location.reload();
        }
        return;
      }
      const current = eligible() && !uncertainDocument;
      if (current) reveal();
      else {
        hide();
        setState("checking");
      }
      observeDataChange();
      void verify(!current);
    }
    function protectConcealedDialog(event: KeyboardEvent) {
      if (event.key === "Escape" && presentationBlocked.current)
        event.preventDefault();
    }
    window.addEventListener("keydown", protectConcealedDialog, true);
    function documentSuspended() {
      uncertainDocument = true;
      check?.abort();
      check = undefined;
      hide();
    }
    function visible() {
      if (!document.hidden) returned();
    }
    function storageChanged(event: StorageEvent) {
      if (event.key === dataRevisionKey) {
        observeDataChange();
        return;
      }
      if (event.key !== sessionFenceKey) return;
      if (!contextIsCurrent(session.current)) {
        concealContent();
        if (!document.hidden) window.location.reload();
      }
    }
    function accountChanged(event: MessageEvent) {
      if (event.data === "signed-out") {
        concealContent();
        if (!document.hidden) window.location.reload();
      }
    }
    function restored(event: PageTransitionEvent) {
      if (event.persisted) {
        uncertainDocument = true;
        returned();
      }
    }
    function onHistory() {
      window.clearTimeout(traversal.current?.timeout);
      scroll.begin();
      const pending = { href: currentHistoryHref(), startedAt: Date.now() };
      traversal.current = pending;
      watchHistory(pending);
      // Keep native Activity/cache boundaries intact for an eligible visited
      // entry, including unsaved input. A temporary loader would unmount it.
      if (!entries.current.has(pending.href) || !eligible()) {
        flushSync(() => {
          setHistoryStatus("loading");
          setAttempt(Symbol());
        });
      }
      if (!eligible()) returned();
    }
    const dataChanged = () => {
      revision = dataRevision();
      entries.current.clear();
    };
    window.addEventListener(dataRevisionKey, dataChanged);
    const channel = openAccountChannel();
    channel?.addEventListener("message", accountChanged);
    retry.current = () => void verify(!eligible() || uncertainDocument);
    if (!acceptContext(session.current)) {
      permanentlyBlocked = true;
      hide();
      entries.current.clear();
      drafts.clear();
      queueMicrotask(() => setState("context-failed"));
    } else if (!eligible()) returned();
    else {
      expire();
      if (!document.hidden) queueMicrotask(reveal);
    }
    beginHistoryRestore = onHistory;
    window.addEventListener("popstate", verifySignedInHistory, true);
    window.addEventListener("pagehide", documentSuspended);
    window.addEventListener("pageshow", restored);
    // Window blur also occurs while this page remains visible in split screen.
    // Conceal only on document lifecycle changes; focus still revalidates.
    window.addEventListener("focus", returned);
    document.addEventListener("visibilitychange", visible);
    document.addEventListener("freeze", documentSuspended);
    document.addEventListener("resume", returned);
    window.addEventListener("online", returned);
    window.addEventListener("storage", storageChanged);
    return () => {
      if (beginHistoryRestore === onHistory) beginHistoryRestore = undefined;
      window.clearTimeout(traversal.current?.timeout);
      window.clearTimeout(expiry);
      traversal.current = null;
      historyScroll.current = null;
      refreshKnownChanges.current = null;
      window.removeEventListener("keydown", protectConcealedDialog, true);
      scroll.dispose();
      check?.abort();
      channel?.close();
      window.removeEventListener(dataRevisionKey, dataChanged);
      window.removeEventListener("pagehide", documentSuspended);
      window.removeEventListener("pageshow", restored);
      window.removeEventListener("focus", returned);
      document.removeEventListener("visibilitychange", visible);
      document.removeEventListener("freeze", documentSuspended);
      document.removeEventListener("resume", returned);
      window.removeEventListener("online", returned);
      window.removeEventListener("storage", storageChanged);
    };
  }, [ownerId, concealContent, eligible, watchHistory, refresh, drafts]);
  useLayoutEffect(() => {
    if (!attempt) historyScroll.current?.restore(pathname, search);
  }, [attempt, pathname, search]);
  return (
    <ConcealSignedInContent value={concealContent}>
      {(state === "checking" || state === "concealed") && (
        <PageContainer className="fixed inset-0 z-50 py-8">
          <LoadingState label="Comprobando sesión…" variant="region" />
        </PageContainer>
      )}
      {state === "context-failed" && (
        <PageContainer className="py-8">
          <Alert
            title="No se puede recuperar esta sesión"
            variant="error"
            announcement="assertive"
          >
            Cierra todas las pestañas de MyClinics. Si el problema continúa,
            borra los datos de este sitio en la configuración del navegador y
            vuelve a iniciar sesión. No se han restaurado datos privados.
          </Alert>
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
      <div
        ref={content}
        className={`flex min-h-dvh flex-col ${state !== "visible" ? "[&_dialog]:invisible [&_dialog::backdrop]:invisible" : ""}`}
        aria-hidden={state !== "visible"}
        inert={state !== "visible"}
        style={
          state === "visible"
            ? undefined
            : { visibility: "hidden", pointerEvents: "none" }
        }
      >
        {sessionNotice && state === "visible" && (
          <PageContainer className="py-4">
            <Alert
              title="No se pudo comprobar la sesión"
              announcement="polite"
              action={{ label: "Reintentar", onClick: () => retry.current?.() }}
            >
              Puedes seguir trabajando. Vuelve a intentarlo cuando tengas
              conexión.
            </Alert>
          </PageContainer>
        )}
        <SignedInOwner value={{ ownerId, context }}>
          <HistoryRestore
            value={{
              attempt,
              status: historyStatus,
              pageRendered,
              retry: retryHistory,
            }}
          >
            <ContinuityDrafts
              value={{
                store: drafts,
                scope: routeHref(pathname, search),
              }}
            >
              <PrefetchSignedInDestinations value={state === "visible"}>
                {state !== "concealed" && children}
              </PrefetchSignedInDestinations>
            </ContinuityDrafts>
          </HistoryRestore>
        </SignedInOwner>
      </div>
    </ConcealSignedInContent>
  );
}
