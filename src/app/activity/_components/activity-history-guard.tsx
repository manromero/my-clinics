"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

function verifyActivityHistory(event: PopStateEvent) {
  if (window.location.pathname !== "/activity") return;

  // The router can restore a cached Activity payload without a server request.
  // Intercept before its popstate handler runs and verify the current session.
  event.stopImmediatePropagation();
  document.documentElement.style.visibility = "hidden";
  window.location.reload();
}

export function ActivityHistoryGuard({ children }: { children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Hide the saved document before the browser stores it in its history
    // cache. A restored document must verify the current account again.
    const hide = () => {
      content.current?.style.setProperty("visibility", "hidden");
    };
    const verifyRestoredSession = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", verifyRestoredSession);
    // Keep this listener for the document's lifetime, including after client
    // navigation to Clinics. Registering the same function again is a no-op.
    window.addEventListener("popstate", verifyActivityHistory, true);
    return () => {
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", verifyRestoredSession);
    };
  }, []);

  return (
    <div ref={content} className="flex min-h-dvh flex-col">
      {children}
    </div>
  );
}
