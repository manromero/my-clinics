"use client";

import { useState, useTransition } from "react";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { signOut } from "./sign-out";

export function SignedInClinicsHeader({
  displayName,
  email,
}: {
  displayName: string;
  email?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <AppHeader
      variant="signed-in"
      currentHref="/clinics"
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
