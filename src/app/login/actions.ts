"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createWritableSupabaseAuthClient } from "@/lib/supabase/auth-actions-client";

export type SignInIssue = "cancelled" | "failed" | null;

const localOrigin = "http://localhost:3000";

export async function startGoogleSignIn(): Promise<SignInIssue> {
  const environment = process.env.VERCEL_ENV;
  let value = localOrigin;
  if (environment === "preview") {
    value = `https://${process.env.VERCEL_BRANCH_URL ?? ""}`;
  } else if (environment === "production") {
    value = process.env.APP_ORIGIN ?? "";
  }
  const origin = URL.parse(value);
  if (
    !origin ||
    (origin.protocol !== "https:" &&
      (environment === "preview" || environment === "production")) ||
    (value !== origin.origin && value !== `${origin.origin}/`)
  ) {
    return "failed";
  }

  // The verifier cookie belongs to the origin that receives this submission.
  const requestOrigin = (await headers()).get("origin");
  if (requestOrigin !== origin.origin) {
    if (origin.origin === localOrigin) return "failed";
    redirect(new URL("/login", origin).href);
  }

  const supabase = await createWritableSupabaseAuthClient();
  if (!supabase) return "failed";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: new URL("/auth/callback", origin).href,
    },
  });
  if (error || !data.url) return "failed";

  redirect(data.url);
}
