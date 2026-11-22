import "server-only";

import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createSupabaseAuthClient(cookies: CookieMethodsServer) {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!projectUrl || !publishableKey?.startsWith("sb_publishable_"))
    return null;

  const url = URL.parse(projectUrl);
  if (url?.protocol !== "https:" || url.username || url.password) return null;

  return createServerClient<Database>(projectUrl, publishableKey, {
    cookies,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });
}
