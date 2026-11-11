"use server";

import { redirect } from "next/navigation";
import { createWritableSupabaseAuthClient } from "@/lib/supabase/auth-actions-client";

export async function signOut(): Promise<string> {
  const supabase = await createWritableSupabaseAuthClient();
  const retry = "Vuelve a intentarlo en unos instantes.";
  if (!supabase) return retry;

  const result = await supabase.auth
    .signOut({ scope: "local" })
    .catch(() => null);
  if (!result || result.error) {
    // Local sign-out can clear cookies before remote revocation fails. Read
    // the outgoing cookie store via a fresh client to check session presence.
    const persisted = await createWritableSupabaseAuthClient();
    const remaining = await persisted?.auth.getSession().catch(() => null);
    if (!remaining || remaining.error || remaining.data.session) return retry;
  }

  redirect("/login");
}
