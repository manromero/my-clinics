import { cookies } from "next/headers";
import { readSessionContext } from "@/lib/supabase/read-session-context";
import {
  sessionMarkerName,
  sessionMarker,
} from "@/lib/supabase/session-context";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { createWritableSupabaseAuthClient } from "@/lib/supabase/auth-actions-client";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  const owner = request.headers.get("X-MyClinics-Owner");
  if (!owner) return new Response(null, { status: 400, headers });

  const client = await createWritableSupabaseAuthClient();
  const verifiedAt = Date.now();
  const result = await client?.auth.getUser().catch(() => null);
  if (!result) return new Response(null, { status: 503, headers });

  const { data, error } = result;
  if (
    error &&
    !isAuthSessionMissingError(error) &&
    error.status !== 400 &&
    error.status !== 401 &&
    error.status !== 403
  ) {
    return new Response(null, { status: 503, headers });
  }
  const context =
    !error && client && data.user?.id === owner
      ? await readSessionContext(client, owner, verifiedAt)
      : null;
  const expectedGeneration = request.headers.get("X-MyClinics-Session");
  if (
    !context ||
    (expectedGeneration && expectedGeneration !== context.generation)
  )
    return new Response(null, { status: 409, headers });
  (await cookies()).set(sessionMarkerName, sessionMarker(context), {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });
  return new Response(null, {
    status: 204,
    headers: {
      ...headers,
      "X-MyClinics-Expires": String(context.expiresAt),
      "X-MyClinics-Verified": String(context.verifiedAt),
    },
  });
}
