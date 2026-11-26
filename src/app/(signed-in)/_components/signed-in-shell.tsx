"use client";

import { useSearchParams, useSelectedLayoutSegment } from "next/navigation";
import { useContext, useState, useTransition, type ReactNode } from "react";
import {
  monthlyPeriodFromQuery,
  monthlyScopeParams,
  type MonthlyPeriod,
} from "@/lib/monthly-scope/monthly-scope";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { signOut } from "../clinics/sign-out";
import {
  ConcealSignedInContent,
  notifySignedOut,
  PrefetchSignedInDestinations,
} from "./signed-in-history-guard";

export function SignedInShell({
  displayName,
  email,
  defaultPeriod,
  children,
}: {
  displayName: string;
  email?: string;
  defaultPeriod: MonthlyPeriod;
  children: ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const query = useSearchParams();
  const [lastScope, setLastScope] = useState(() =>
    monthlyScopeParams({ ...defaultPeriod, clinicId: null }),
  );
  const monthly = segment === "activity" || segment === "summary";
  const scope = monthly
    ? monthlyScopeParams({
        ...monthlyPeriodFromQuery(Object.fromEntries(query)),
        clinicId: query.get("clinic") || null,
      })
    : lastScope;
  if (monthly && lastScope !== scope) setLastScope(scope);
  const currentHref =
    segment === "clinics" ||
    segment === "activity" ||
    segment === "summary" ||
    segment === "invoices"
      ? (`/${segment}` as const)
      : undefined;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const conceal = useContext(ConcealSignedInContent);
  const prefetch = useContext(PrefetchSignedInDestinations);

  return (
    <>
      <AppHeader
        variant="signed-in"
        prefetch={prefetch}
        currentHref={currentHref}
        hrefs={{
          "/activity": `/activity?${scope}`,
          "/summary": `/summary?${scope}`,
        }}
        availableDestinations={[
          "/clinics",
          "/activity",
          "/summary",
          "/invoices",
        ]}
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
