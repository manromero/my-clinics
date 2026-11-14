import { createWritableSupabaseAuthClient } from "@/lib/supabase/auth-actions-client";
import { currentActivityHref } from "../../activity/_lib/activity-view";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const providerError = params.get("error");
  const providerErrorCode = params.get("error_code");

  if (
    providerError === "access_denied" ||
    providerErrorCode === "access_denied"
  )
    return redirectTo("/login?signIn=cancelled");

  if (!providerError && !providerErrorCode && code) {
    const supabase = await createWritableSupabaseAuthClient();
    const result = await supabase?.auth.exchangeCodeForSession(code);
    if (result?.data.session && !result.error)
      return redirectTo(currentActivityHref());
  }

  return redirectTo("/login?signIn=failed");
}

function redirectTo(location: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
