"use client";

import { useEffect, useState } from "react";
import {
  getSupabaseBrowserClient,
  hasSupabaseBrowserConfig,
} from "./browser-client";

type VerifiedAccess =
  { status: "authorized"; userId: string } | { status: "denied" | "failed" };

export function clinicAccessFromClaims(
  claims: Record<string, unknown>,
): VerifiedAccess {
  const metadata = claims.app_metadata as Record<string, unknown> | undefined;
  return claims.role === "authenticated" &&
    typeof claims.sub === "string" &&
    claims.sub.length > 0 &&
    claims.is_anonymous === false &&
    metadata?.myclinics_clinic_reader === true
    ? { status: "authorized", userId: claims.sub }
    : { status: "denied" };
}

export function useClinicSession() {
  const [token, setToken] = useState<string | null>();
  const [verified, setVerified] = useState<{
    token: string;
    access: VerifiedAccess;
  }>();

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client || !token) return;
    let current = true;
    function finish(access: VerifiedAccess) {
      if (current && token) setVerified({ token, access });
    }
    void client.auth.getClaims(token).then(
      ({ data, error }) =>
        finish(
          error || !data?.claims
            ? { status: "failed" }
            : clinicAccessFromClaims(data.claims),
        ),
      () => finish({ status: "failed" }),
    );
    return () => {
      current = false;
    };
  }, [token]);

  if (!hasSupabaseBrowserConfig()) return { status: "unconfigured" } as const;
  if (token === null) return { status: "signed-out" } as const;
  if (!token || verified?.token !== token)
    return { status: "checking" } as const;
  return verified.access;
}
