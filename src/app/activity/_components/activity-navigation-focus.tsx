"use client";

import { createContext, useRef, type ReactNode, type RefObject } from "react";
import type { ActivityPeriod } from "../_lib/activity-view";

type FocusIntent = { target: ActivityPeriod; control: HTMLElement };

export const ActivityNavigationFocus =
  createContext<RefObject<FocusIntent | null> | null>(null);

export function ActivityNavigationFocusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pendingFocusRef = useRef<FocusIntent | null>(null);
  return (
    <ActivityNavigationFocus value={pendingFocusRef}>
      {children}
    </ActivityNavigationFocus>
  );
}
