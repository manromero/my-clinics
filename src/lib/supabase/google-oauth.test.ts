import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, expect, it, vi } from "vitest";
import type { Database } from "./database.types";
import { beginGoogleSignIn, completeGoogleSignIn } from "./google-oauth";

function fixture() {
  const auth = {
    exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
    signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };
  return { auth, client: { auth } as unknown as SupabaseClient<Database> };
}

afterEach(() => window.history.replaceState(null, "", "/"));

it("exchanges one PKCE code and removes callback parameters before the request", async () => {
  const { auth, client } = fixture();
  window.history.replaceState(
    null,
    "",
    "/login?code=fixture&next=https%3A%2F%2Fexample.net",
  );
  auth.exchangeCodeForSession.mockImplementation(async () => {
    expect(window.location.pathname + window.location.search).toBe("/login");
    return { error: null };
  });
  expect(await completeGoogleSignIn(client)).toBe(true);
  expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("fixture");
  expect(await completeGoogleSignIn(client)).toBe(true);
  expect(auth.exchangeCodeForSession).toHaveBeenCalledTimes(1);
});

it.each([
  "?error=access_denied",
  "?code=one&code=two",
  "#access_token=fixture",
])(
  "clears an invalid callback %s without exchanging a code",
  async (callback) => {
    const { auth, client } = fixture();
    window.history.replaceState(null, "", `/login${callback}`);
    expect(await completeGoogleSignIn(client)).toBe(false);
    expect(window.location.search + window.location.hash).toBe("");
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  },
);

it("chooses another account using the fixed same-origin callback", async () => {
  const { auth, client } = fixture();
  expect(await beginGoogleSignIn(client, true)).toBe(true);
  expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  expect(auth.signInWithOAuth).toHaveBeenCalledWith({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/login`,
      queryParams: { prompt: "select_account" },
    },
  });
});
