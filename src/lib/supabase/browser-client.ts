import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function hasSupabaseBrowserConfig() {
  if (!projectUrl || !publishableKey?.startsWith("sb_publishable_"))
    return false;
  try {
    const url = new URL(projectUrl);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

let client: SupabaseClient<Database> | undefined;

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined" || !hasSupabaseBrowserConfig()) return null;
  return (client ??= createClient<Database>(projectUrl!, publishableKey!, {
    auth: { flowType: "pkce", detectSessionInUrl: false },
  }));
}
