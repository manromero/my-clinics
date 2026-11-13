"use client";

import { useState, useTransition } from "react";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { signOut } from "../clinics/sign-out";

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

  return (
    <AppHeader
      variant="signed-in"
      currentHref={currentHref}
      availableDestinations={["/clinics"]}
      account={{
        identity: { displayName, email },
        signOutPending: pending,
        signOutError: error,
        onSignOut: () => {
          startTransition(async () => {
            const error = await signOut();
            setError(error);
          });
        },
      }}
    />
  );
}
