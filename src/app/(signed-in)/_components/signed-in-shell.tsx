"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useContext, useState, useTransition, type ReactNode } from "react";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { signOut } from "../clinics/sign-out";
import {
  ConcealSignedInContent,
  notifySignedOut,
} from "./signed-in-history-guard";

export function SignedInShell({
  displayName,
  email,
  children,
}: {
  displayName: string;
  email?: string;
  children: ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const currentHref =
    segment === "clinics" || segment === "activity" || segment === "summary"
      ? (`/${segment}` as const)
      : undefined;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const conceal = useContext(ConcealSignedInContent);

  return (
    <>
      <AppHeader
        variant="signed-in"
        currentHref={currentHref}
        availableDestinations={["/clinics", "/activity", "/summary"]}
        account={{
          identity: { displayName, email },
          signOutPending: pending,
          signOutError: error,
          onSignOut: () => {
            startTransition(async () => {
              const error = await signOut();
              if (error) {
                setError(error);
                return;
              }
              conceal();
              notifySignedOut();
              window.location.replace("/login");
            });
          },
        }}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <AppFooter
        identity="MyClinics"
        metadata={
          segment === "summary"
            ? undefined
            : "Entorno de desarrollo · Datos sintéticos"
        }
      />
    </>
  );
}
