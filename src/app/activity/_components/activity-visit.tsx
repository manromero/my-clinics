"use client";

import { createContext, useState, type ReactNode } from "react";

export const LastCreatedClinic = createContext<{
  clinicId?: string;
  rememberClinic: (clinicId: string) => void;
}>({ rememberClinic: () => {} });

export function ActivityVisit({ children }: { children: ReactNode }) {
  const [clinicId, rememberClinic] = useState<string>();

  return (
    <LastCreatedClinic value={{ clinicId, rememberClinic }}>
      {children}
    </LastCreatedClinic>
  );
}
