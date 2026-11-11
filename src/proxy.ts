import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseAuthClient } from "@/lib/supabase/auth-client";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createSupabaseAuthClient({
    getAll: () => request.cookies.getAll(),
    setAll: (updates, headers) => {
      for (const { name, value } of updates) request.cookies.set(name, value);

      // Pass refreshed cookies to both the current render and the browser.
      const refreshed = NextResponse.next({ request });
      for (const cookie of response.cookies.getAll())
        refreshed.cookies.set(cookie);
      for (const { name, value, options } of updates)
        refreshed.cookies.set(name, value, options);
      for (const [name, value] of Object.entries(headers))
        refreshed.headers.set(name, value);
      response = refreshed;
    },
  });
  await supabase?.auth.getClaims();
  return response;
}

export const config = {
  matcher: "/clinics",
};
