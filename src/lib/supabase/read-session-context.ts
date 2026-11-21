import "server-only";

import { createHash } from "node:crypto";
import type { SessionContext } from "./session-context";
import type { createSupabaseAuthClient } from "./auth-client";

// getUser must have verified this request's client first. These decoded claims
// identify presentation state only; they never authorize data access or writes.
export async function readSessionContext(
  client: NonNullable<ReturnType<typeof createSupabaseAuthClient>>,
  ownerId: string,
  verifiedAt = Date.now(),
): Promise<SessionContext | null> {
  const result = await client.auth.getSession().catch(() => null);
  const token = result?.data.session?.access_token;
  if (result?.error || !token) return null;
  try {
    const claims = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    ) as Record<string, unknown>;
    if (
      claims.sub !== ownerId ||
      typeof claims.session_id !== "string" ||
      typeof claims.exp !== "number"
    )
      return null;
    return {
      generation: createHash("sha256").update(claims.session_id).digest("hex"),
      expiresAt: claims.exp,
      verifiedAt,
    };
  } catch {
    return null;
  }
}
