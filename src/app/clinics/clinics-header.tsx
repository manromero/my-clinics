import { cookies } from "next/headers";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { createSupabaseAuthClient } from "@/lib/supabase/auth-client";
import { SignedInClinicsHeader } from "./signed-in-clinics-header";

export async function ClinicsHeader() {
  // Proxy refreshes and writes cookies before rendering this component.
  const store = await cookies();
  const supabase = createSupabaseAuthClient({ getAll: () => store.getAll() });
  const result = await supabase?.auth.getClaims();
  const claims = result?.data?.claims;
  if (!claims?.sub) return <AppHeader variant="public" />;

  const email = typeof claims.email === "string" ? claims.email : undefined;
  const name = claims.user_metadata?.full_name;
  const displayName =
    (typeof name === "string" && name.trim()) || email || "Usuario";

  return <SignedInClinicsHeader displayName={displayName} email={email} />;
}
