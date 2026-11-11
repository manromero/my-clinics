"use server";

import { redirect } from "next/navigation";
import { createWritableSupabaseAuthClient } from "@/lib/supabase/auth-actions-client";
export type SignInIssue = "cancelled" | "failed" | null;

export async function startGoogleSignIn(): Promise<SignInIssue> {
  const supabase = await createWritableSupabaseAuthClient();
  if (!supabase) return "failed";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Exact URL registered for the hosted development project's PKCE flow.
      redirectTo: "http://localhost:3000/auth/callback",
    },
  });
  if (error || !data.url) return "failed";

  redirect(data.url);
}
