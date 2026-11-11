import "server-only";

import { cookies } from "next/headers";
import { createSupabaseAuthClient } from "./auth-client";

// Only use from a Server Action or Route Handler, where cookies are writable.
export async function createWritableSupabaseAuthClient() {
  const store = await cookies();
  return createSupabaseAuthClient({
    getAll: () => store.getAll(),
    setAll: (updates) => {
      for (const { name, value, options } of updates)
        store.set(name, value, options);
    },
  });
}
