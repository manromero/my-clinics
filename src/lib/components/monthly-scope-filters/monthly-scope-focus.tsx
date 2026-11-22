"use client";

import { createContext, useRef, type ReactNode, type RefObject } from "react";
import type { MonthlyPeriod } from "@/lib/monthly-scope/monthly-scope";

type FocusIntent = { target: MonthlyPeriod; control: HTMLElement };

export const MonthlyScopeFocus =
  createContext<RefObject<FocusIntent | null> | null>(null);

export function MonthlyScopeFocusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pendingFocusRef = useRef<FocusIntent | null>(null);
  return (
    <MonthlyScopeFocus value={pendingFocusRef}>{children}</MonthlyScopeFocus>
  );
}
