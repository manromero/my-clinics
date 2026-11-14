import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createWritableSupabaseAuthClient } from "./auth-actions-client";
import { createSupabaseAuthClient } from "./auth-client";

async function readSession(
  client: ReturnType<typeof createSupabaseAuthClient>,
) {
  const result = await client?.auth.getUser().catch(() => null);
  const user = result?.data.user;
  if (!client || result?.error || !user?.id) return null;
  return { client, user };
}

// Proxy refreshes the cookies before rendering. Cache only within the render.
export const readSupabaseSession = cache(async () => {
  const store = await cookies();
  return readSession(
    createSupabaseAuthClient({ getAll: () => store.getAll() }),
  );
});

export async function requireSupabaseSession() {
  const session = await readSupabaseSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireSupabaseActionSession() {
  const session = await readSession(await createWritableSupabaseAuthClient());
  if (!session) redirect("/login");
  return session;
}
