"use server";

import { redirect } from "next/navigation";
import { createWritableSupabaseAuthClient } from "@/lib/supabase/auth-actions-client";

export async function signOut(): Promise<string> {
  const supabase = await createWritableSupabaseAuthClient();
  const result = await supabase?.auth.signOut({ scope: "local" });
  if (!result || result.error) return "Vuelve a intentarlo en unos instantes.";

  redirect("/login");
}
