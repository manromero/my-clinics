"use client";

import { createContext, useState, type ReactNode } from "react";

type CreatedClinic = { ownerId: string; clinicId: string };

export const LastCreatedClinic = createContext<{
  lastCreatedClinic?: CreatedClinic;
  rememberClinic: (clinic: CreatedClinic) => void;
}>({ rememberClinic: () => {} });

export function ActivityVisit({ children }: { children: ReactNode }) {
  const [lastCreatedClinic, rememberClinic] = useState<CreatedClinic>();

  return (
    <LastCreatedClinic value={{ lastCreatedClinic, rememberClinic }}>
      {children}
    </LastCreatedClinic>
  );
}
