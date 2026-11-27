import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import { templateInfrastructure } from "./infrastructure.ts";

export function createTemplateServer(auth: SupabaseClient<Database>) {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_TEMPLATE_SECRET_KEY;
  if (
    !projectUrl ||
    !secret ||
    (!secret.startsWith("sb_secret_") && !secret.startsWith("eyJ"))
  )
    return null;
  const admin = createClient<Database>(projectUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return templateInfrastructure(auth, admin, projectUrl, secret);
}
