"use client";

import { useContext, useState, useTransition } from "react";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { signOut } from "../clinics/sign-out";
import {
  ConcealSignedInContent,
  notifySignedOut,
} from "./signed-in-history-guard";

export function SignedInHeader({
  displayName,
  email,
  currentHref = "/clinics",
}: {
  displayName: string;
  email?: string;
  currentHref?: "/clinics" | "/activity";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const conceal = useContext(ConcealSignedInContent);

  return (
    <AppHeader
      variant="signed-in"
      currentHref={currentHref}
      availableDestinations={["/activity", "/clinics"]}
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
  );
}
