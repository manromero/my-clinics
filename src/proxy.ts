import { createHash } from "node:crypto";
import {
  sessionMarkerName,
  sessionMarker,
} from "@/lib/supabase/session-context";
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseAuthClient } from "@/lib/supabase/auth-client";

export async function proxy(request: NextRequest) {
  if (/^\/components(?:\/|$)/i.test(request.nextUrl.pathname)) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();

    // Stop the request before Next.js generates HTML or a Flight payload.
    return new NextResponse("404 — Página no encontrada.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

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
  const verifiedAt = Date.now();
  const result = await supabase?.auth.getClaims();
  const claims = result?.data?.claims;
  if (
    !result?.error &&
    typeof claims?.session_id === "string" &&
    typeof claims.exp === "number"
  ) {
    response.cookies.set(
      sessionMarkerName,
      sessionMarker({
        generation: createHash("sha256")
          .update(claims.session_id)
          .digest("hex"),
        expiresAt: claims.exp,
        verifiedAt,
      }),
      {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: false,
      },
    );
  } else response.cookies.delete(sessionMarkerName);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    "/clinics",
    "/activity",
    "/summary",
    "/login",
    "/components/:path*",
  ],
};
