// @vitest-environment node

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as authCallback } from "@/app/auth/callback/route";
import { signOut } from "@/app/clinics/sign-out";
import { startGoogleSignIn } from "@/app/login/actions";
import { proxy } from "@/proxy";
import { createSupabaseAuthClient } from "./auth-client";

const project = "https://auth-fixture.supabase.co";
const origin = "http://localhost:3000";
const sessionCookie = "sb-auth-fixture-auth-token";
const cookies = new Map<string, string>();
let failSessionCookieRemoval = false;

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => Array.from(cookies, ([name, value]) => ({ name, value })),
    set: (name: string, value: string, options: { maxAge?: number }) => {
      if (
        name === sessionCookie &&
        options.maxAge === 0 &&
        failSessionCookieRemoval
      )
        throw new Error("Could not remove session cookie");
      if (options.maxAge === 0) cookies.delete(name);
      else cookies.set(name, value);
    },
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect: ${url}`);
  },
}));

function callback(query: string) {
  return authCallback(new Request(`${origin}/auth/callback?${query}`));
}

function fixtureSession(expiresIn: number, refreshToken: string) {
  const exp = Math.floor(Date.now() / 1000) + expiresIn;
  const header = Buffer.from('{"alg":"HS256","typ":"JWT"}').toString(
    "base64url",
  );
  const payload = Buffer.from(
    JSON.stringify({ sub: "fixture-user", exp }),
  ).toString("base64url");
  return {
    access_token: `${header}.${payload}.Zml4dHVyZQ`,
    expires_at: exp,
    expires_in: expiresIn,
    refresh_token: refreshToken,
    token_type: "bearer",
    user: { id: "fixture-user", email: "fixture@example.test" },
  };
}

describe("Supabase SSR authentication with a controlled Auth transport", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", project);
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_fixture",
    );
  });

  afterEach(() => {
    cookies.clear();
    failSessionCookieRemoval = false;
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("persists a PKCE session and rotates an expired token for render and browser", async () => {
    const expired = fixtureSession(-1, "initial-fixture-refresh");
    const rotated = fixtureSession(3600, "rotated-fixture-refresh");
    const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
      const url = new URL(String(input));
      expect(url.origin).toBe(project);
      const grant = url.searchParams.get("grant_type");
      if (grant === "pkce") {
        const body = JSON.parse(String(init?.body));
        expect(body.auth_code).toBe("fixture-code");
        expect(body.code_verifier).toBeTruthy();
        return Response.json(expired);
      }
      if (grant === "refresh_token") {
        expect(JSON.parse(String(init?.body)).refresh_token).toBe(
          expired.refresh_token,
        );
        return Response.json(rotated);
      }
      expect(new Headers(init?.headers).get("authorization")).toBe(
        `Bearer ${rotated.access_token}`,
      );
      expect(url.pathname).toBe("/auth/v1/user");
      return Response.json(rotated.user);
    });
    vi.stubGlobal("fetch", fetch);

    const redirect = await startGoogleSignIn().catch((error: Error) =>
      error.message.replace("redirect: ", ""),
    );
    const authorizeUrl = new URL(redirect!);
    expect(authorizeUrl.origin + authorizeUrl.pathname).toBe(
      `${project}/auth/v1/authorize`,
    );
    expect(authorizeUrl.searchParams.get("provider")).toBe("google");
    expect(authorizeUrl.searchParams.get("redirect_to")).toBe(
      `${origin}/auth/callback`,
    );
    expect(authorizeUrl.searchParams.get("code_challenge_method")).toBe("s256");

    const result = await callback(
      "code=fixture-code&next=//external.example/path",
    );
    expect(result.headers.get("location")).toBe("/clinics");
    expect(result.headers.get("cache-control")).toContain("no-store");

    const request = new NextRequest(`${origin}/clinics`);
    const expiredCookie = cookies.get(sessionCookie);
    expect(expiredCookie).toBeTruthy();
    request.cookies.set(sessionCookie, expiredCookie!);
    const refreshed = await proxy(request);
    const update = refreshed.cookies.get(sessionCookie);
    expect(update?.httpOnly).toBe(true);
    expect(update?.value).toBeTruthy();
    expect(update?.value).not.toBe(expiredCookie);
    expect(refreshed.headers.get("cache-control")).toContain("no-store");

    const forRender = createSupabaseAuthClient({
      getAll: () => request.cookies.getAll(),
    });
    expect((await forRender?.auth.getClaims())?.data?.claims.sub).toBe(
      "fixture-user",
    );
    expect(request.cookies.get(sessionCookie)?.value).toBe(update?.value);
    expect(
      fetch.mock.calls.filter(([url]) =>
        String(url).includes("grant_type=refresh_token"),
      ),
    ).toHaveLength(1);
  });

  it.each([204, 503])(
    "clears the local session and opens login when remote logout returns %i",
    async (status) => {
      const { fetch } = setupSignOut(status);

      await expect(signOut()).rejects.toThrow("redirect: /login");

      expect(fetch).toHaveBeenCalledOnce();
      expect(cookies.has(sessionCookie)).toBe(false);
    },
  );

  it("offers retry when session cookie removal fails", async () => {
    const { fetch, cookie } = setupSignOut(204);
    const reportError = vi.spyOn(console, "error").mockImplementation(() => {});
    failSessionCookieRemoval = true;

    await expect(signOut()).resolves.toBe(
      "Vuelve a intentarlo en unos instantes.",
    );
    expect(reportError).toHaveBeenCalledWith(
      new Error("Could not remove session cookie"),
    );
    expect(cookies.get(sessionCookie)).toBe(cookie);
    expect(fetch).toHaveBeenCalledOnce();

    failSessionCookieRemoval = false;
    await expect(signOut()).rejects.toThrow("redirect: /login");
    expect(cookies.has(sessionCookie)).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["error=access_denied&code=ignored", "cancelled"],
    ["error_code=access_denied", "cancelled"],
    ["error=server_error&code=ignored", "failed"],
    ["next=https://external.example", "failed"],
    ["code=missing-verifier", "failed"],
  ])("returns safe retry feedback for %s", async (query, issue) => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const response = await callback(query);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`/login?signIn=${issue}`);
    expect(fetch).not.toHaveBeenCalled();
  });
});

function setupSignOut(status: number) {
  const session = fixtureSession(3600, "fixture-refresh");
  const cookie = `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
  cookies.set(sessionCookie, cookie);
  const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
    const url = new URL(String(input));
    expect(url.href).toBe(`${project}/auth/v1/logout?scope=local`);
    expect(new Headers(init?.headers).get("authorization")).toBe(
      `Bearer ${session.access_token}`,
    );
    return new Response(null, { status });
  });
  vi.stubGlobal("fetch", fetch);
  return { fetch, cookie };
}
