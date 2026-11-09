import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export async function completeGoogleSignIn(
  client: SupabaseClient<Database> | null,
) {
  const url = new URL(window.location.href);
  const fragment = new URLSearchParams(url.hash.slice(1));
  const callbackKeys = [
    "code",
    "error",
    "error_code",
    "error_description",
    "access_token",
    "refresh_token",
  ];
  if (
    !callbackKeys.some((key) => url.searchParams.has(key) || fragment.has(key))
  )
    return true;

  window.history.replaceState(null, "", "/login");
  const codes = url.searchParams.getAll("code");
  if (
    !client ||
    url.hash ||
    url.searchParams.has("error") ||
    url.searchParams.has("error_code") ||
    url.searchParams.has("error_description") ||
    codes.length !== 1 ||
    !codes[0]
  )
    return false;
  const { error } = await client.auth.exchangeCodeForSession(codes[0]);
  return !error;
}

export async function beginGoogleSignIn(
  client: SupabaseClient<Database>,
  replaceSession: boolean,
) {
  if (replaceSession) {
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) return false;
  }
  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: new URL("/login", window.location.origin).href,
      queryParams: { prompt: "select_account" },
    },
  });
  return !error;
}
