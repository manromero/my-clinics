import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createSupabaseServerClient() {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!projectUrl || !publishableKey?.startsWith("sb_publishable_"))
    return null;

  try {
    const url = new URL(projectUrl);
    if (url.protocol !== "https:" || url.username || url.password) return null;

    return createClient<Database>(projectUrl, publishableKey, {
      accessToken: async () => null,
    });
  } catch {
    return null;
  }
}
