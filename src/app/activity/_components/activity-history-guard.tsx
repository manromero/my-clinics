"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ActivityHistoryGuard({ children }: { children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
