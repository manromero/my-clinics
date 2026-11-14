import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { createWritableSupabaseAuthClient } from "@/lib/supabase/auth-actions-client";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  const owner = request.headers.get("X-MyClinics-Owner");
  if (!owner) return new Response(null, { status: 400, headers });

  const client = await createWritableSupabaseAuthClient();
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
  return new Response(null, {
    status: !error && data.user?.id === owner ? 204 : 409,
    headers,
  });
}
