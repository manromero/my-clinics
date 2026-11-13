import { createServerClient } from "@supabase/ssr";
import type { BrowserContext } from "@playwright/test";
import type { Database } from "../../src/lib/supabase/database.types";
import { account, appOrigin, hostedTarget, type ProjectName } from "./config";

export async function signIn(project: ProjectName, context?: BrowserContext) {
  const { url, key } = hostedTarget();
  const fixture = account(project);
  const cookies = new Map<string, { name: string; value: string }>();
  const client = createServerClient<Database>(url, key, {
    global: {
      // Refuse redirects so even misrouted responses cannot forward credentials.
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          redirect: "error",
          signal: AbortSignal.timeout(10_000),
        }),
    },
    cookies: {
      getAll: () => [...cookies.values()],
      setAll: (updates) => {
        for (const { name, value, options } of updates) {
          if (options.maxAge === 0) cookies.delete(name);
          else cookies.set(name, { name, value });
        }
      },
    },
    cookieOptions: { httpOnly: true, secure: true },
  });

  const signedIn = await client.auth.signInWithPassword({
    email: fixture.email,
    password: fixture.password,
  });
  if (signedIn.error || !signedIn.data.session) {
    throw new Error(
      "Could not sign in to the dedicated hosted acceptance account.",
    );
  }
  const { data, error } = await client.auth.getUser();
  if (
    error ||
    data.user?.id !== fixture.id ||
    data.user.email?.toLowerCase() !== fixture.email.toLowerCase() ||
    data.user.user_metadata.full_name !== fixture.displayName
  ) {
    throw new Error(
      "The hosted session does not match the dedicated acceptance account.",
    );
  }
  if (context) {
    await context.addCookies(
      [...cookies.values()].map((cookie) => ({
        ...cookie,
        url: appOrigin,
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      })),
    );
  }
  return client;
}

export type OwnerClient = Awaited<ReturnType<typeof signIn>>;

export async function verifyFixture(client: OwnerClient, project: ProjectName) {
  const fixture = account(project);
  const { data, error } = await client
    .from("clinics")
    .select("clinic_key:id::text,name,percentage,active")
    .filter("id", "eq", fixture.clinicId)
    .maybeSingle();
  if (
    error ||
    !data?.active ||
    data.name !== fixture.clinicName ||
    data.percentage !== 25
  ) {
    throw new Error(
      "The expected active 25% fixture clinic is unavailable to the dedicated account.",
    );
  }
}
