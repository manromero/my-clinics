import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createWritableSupabaseAuthClient } from "./auth-actions-client";
import { createSupabaseAuthClient } from "./auth-client";

async function verifySession(
  client: ReturnType<typeof createSupabaseAuthClient>,
) {
  const result = await client?.auth.getUser().catch(() => null);
  const user = result?.data.user;
  if (!client || result?.error || !user?.id) redirect("/login");
  return { client, user };
}

// Proxy refreshes the cookies before rendering. Cache only within the render.
export const requireSupabaseSession = cache(async () => {
  const store = await cookies();
  return verifySession(
    createSupabaseAuthClient({ getAll: () => store.getAll() }),
  );
});

export async function requireSupabaseActionSession() {
  return verifySession(await createWritableSupabaseAuthClient());
}
