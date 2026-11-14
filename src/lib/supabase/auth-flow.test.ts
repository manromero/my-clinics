// @vitest-environment node

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readActivity } from "@/app/activity/_lib/read-activity";
import {
  deleteActivity,
  saveActivity,
} from "@/app/activity/_lib/write-activity";
import { GET as authCallback } from "@/app/auth/callback/route";
import { GET as checkSession } from "@/app/auth/session/route";
import { createClinic } from "@/app/clinics/create-clinic";
import { listClinics } from "@/app/clinics/list-clinics";
import { signOut } from "@/app/clinics/sign-out";
import { updateClinic } from "@/app/clinics/update-clinic";
import { startGoogleSignIn } from "@/app/login/actions";
import { proxy } from "@/proxy";
import { createSupabaseAuthClient } from "./auth-client";

const project = "https://auth-fixture.supabase.co";
const origin = "http://localhost:3000";
const previewHost =
  "my-clinics-git-feature-supabase-sign-in-manromeros-projects.vercel.app";
const previewOrigin = `https://${previewHost}`;
const productionOrigin = "https://my-clinics.vercel.app";
const sessionCookie = "sb-auth-fixture-auth-token";
const cookies = new Map<string, string>();
let requestOrigin = origin;
let failSessionCookieRemoval = false;

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      origin: requestOrigin,
      "x-forwarded-host": "untrusted.example.test",
    }),
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
    vi.stubEnv("APP_ORIGIN", undefined);
    vi.stubEnv("VERCEL_ENV", undefined);
    vi.stubEnv("VERCEL_BRANCH_URL", undefined);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", project);
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_fixture",
    );
  });

  afterEach(() => {
    cookies.clear();
    requestOrigin = origin;
    failSessionCookieRemoval = false;
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it.each([
    { environment: "preview", expectedOrigin: previewOrigin },
    { environment: "production", expectedOrigin: productionOrigin },
  ])(
    "starts PKCE on the trusted $environment origin",
    async ({ environment, expectedOrigin }) => {
      vi.stubEnv("VERCEL_ENV", environment);
      vi.stubEnv("VERCEL_BRANCH_URL", previewHost);
      vi.stubEnv("APP_ORIGIN", `${productionOrigin}/`);
      requestOrigin = expectedOrigin;

      const destination = await startGoogleSignIn().catch((error: Error) =>
        error.message.replace("redirect: ", ""),
      );
      const authorizeUrl = new URL(destination!);
      expect(authorizeUrl.origin + authorizeUrl.pathname).toBe(
        `${project}/auth/v1/authorize`,
      );
      expect(authorizeUrl.searchParams.get("redirect_to")).toBe(
        `${expectedOrigin}/auth/callback`,
      );
      expect(authorizeUrl.searchParams.get("code_challenge_method")).toBe(
        "s256",
      );
      expect(
        [...cookies.keys()].some((name) => name.includes("code-verifier")),
      ).toBe(true);
    },
  );

  it("sends another deployment alias to the canonical login before writing any PKCE cookie", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_BRANCH_URL", previewHost);
    vi.stubEnv("APP_ORIGIN", productionOrigin);
    requestOrigin = "https://alternate-deployment.example.test";

    await expect(startGoogleSignIn()).rejects.toThrow(
      `redirect: ${previewOrigin}/login`,
    );
    expect(cookies.size).toBe(0);
  });

  it.each([undefined, "", "user@example.test", "example.test/some-path"])(
    "refuses Preview OAuth without a valid branch hostname (%s)",
    async (branchHost) => {
      vi.stubEnv("VERCEL_ENV", "preview");
      vi.stubEnv("VERCEL_BRANCH_URL", branchHost);
      vi.stubEnv("VERCEL_URL", "unique-deployment.example.test");
      vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "my-clinics.vercel.app");
      vi.stubEnv("APP_ORIGIN", productionOrigin);
      requestOrigin = previewOrigin;

      await expect(startGoogleSignIn()).resolves.toBe("failed");
      expect(cookies.size).toBe(0);
    },
  );

  it.each([
    undefined,
    origin,
    "http://myclinics.example.test",
    "https://myclinics.example.test/login",
    "https://myclinics.example.test/?next=elsewhere",
    "https://user@myclinics.example.test",
  ])(
    "refuses Production OAuth with an unset or invalid APP_ORIGIN (%s)",
    async (configuredOrigin) => {
      vi.stubEnv("VERCEL_ENV", "production");
      vi.stubEnv("APP_ORIGIN", configuredOrigin);
      vi.stubEnv(
        "VERCEL_PROJECT_PRODUCTION_URL",
        "myclinics-production.example.test",
      );
      requestOrigin = productionOrigin;

      await expect(startGoogleSignIn()).resolves.toBe("failed");
      expect(cookies.size).toBe(0);
    },
  );

  it("persists a PKCE session and rotates an expired token for render and browser", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-31T23:30:00Z"));
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
    expect(result.headers.get("location")).toBe("/activity?year=2026&month=11");
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
    "reports a cleared local session when remote logout returns %i",
    async (status) => {
      const { fetch } = setupSignOut(status);

      await expect(signOut()).resolves.toBeNull();

      expect(fetch).toHaveBeenCalledOnce();
      expect(cookies.has(sessionCookie)).toBe(false);
    },
  );

  it.each(["missing", "expired", "rejected"])(
    "denies clinic and activity data entry points when the session is %s",
    async (state) => {
      if (state !== "missing") {
        storeSession(
          fixtureSession(state === "expired" ? -1 : 3600, "invalid-refresh"),
        );
      }
      const fetch = vi
        .fn<typeof globalThis.fetch>()
        .mockImplementation(async (input) => {
          expect(new URL(String(input)).pathname).toBe(
            state === "expired" ? "/auth/v1/token" : "/auth/v1/user",
          );
          return Response.json({ message: "Invalid session" }, { status: 401 });
        });
      vi.stubGlobal("fetch", fetch);

      await expect(listClinics()).rejects.toThrow("redirect: /login");
      await expect(
        readActivity({ year: 2026, month: 12 }, undefined, undefined),
      ).rejects.toThrow("redirect: /login");
      await expect(createClinic(new FormData())).rejects.toThrow(
        "redirect: /login",
      );
      await expect(updateClinic("1", new FormData())).rejects.toThrow(
        "redirect: /login",
      );
      expect(
        fetch.mock.calls.some(([url]) => String(url).includes("/rest/v1/")),
      ).toBe(false);
      if (state === "missing") expect(fetch).not.toHaveBeenCalled();
      else expect(fetch).toHaveBeenCalled();
    },
  );

  it("reads exact scoped activity using the current owner after an account change", async () => {
    const activeId = "9007199254740993";
    const historicalId = "9007199254740995";
    const clinic = (clinic_key: string, active: boolean) => ({
      clinic_key,
      name: clinic_key,
      percentage: "30.5000",
      active,
    });
    const exact = "9007199254740993.27";
    const totals = (row_count: string, clinics: { clinic_id: string }[]) => ({
      price: row_count === "0" ? "0" : exact,
      gross: "0",
      net: "0",
      row_count,
      clinics,
    });
    let session = fixtureSession(3600, "first-account");
    storeSession(session);
    const calls: string[] = [];
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async (input, init) => {
        const url = new URL(String(input));
        expect(new Headers(init?.headers).get("authorization")).toBe(
          `Bearer ${session.access_token}`,
        );
        if (url.pathname === "/auth/v1/user")
          return Response.json(session.user);
        const secondAccount = session.refresh_token === "second-account";
        if (url.pathname === "/rest/v1/clinics") {
          if (url.searchParams.has("id")) return Response.json([]);
          return Response.json(
            secondAccount
              ? []
              : [
                  clinic(activeId, true),
                  clinic(historicalId, false),
                  clinic("9007199254740996", false),
                ],
          );
        }
        if (url.pathname.endsWith("/activity_period_totals")) {
          const { p_start, p_end, p_clinic_id } = JSON.parse(
            String(init?.body),
          );
          expect([p_start, p_end]).toEqual(["9999-12-01", "10000-01-01"]);
          calls.push(p_clinic_id ?? "all");
          if (secondAccount) return Response.json(totals("0", []));
          return Response.json(
            totals(p_clinic_id ? "1" : "53", [{ clinic_id: historicalId }]),
          );
        }
        expect(url.pathname).toBe("/rest/v1/activity");
        expect(url.searchParams.getAll("activity_date")).toEqual([
          "gte.9999-12-01",
          "lt.10000-01-01",
        ]);
        if (url.searchParams.get("select") === "activity_date") {
          expect(url.searchParams.get("order")).toBe("id.desc");
          expect(url.searchParams.get("limit")).toBe("1");
          expect(url.searchParams.has("clinic_id")).toBe(false);
          expect(url.searchParams.has("offset")).toBe(false);
          return Response.json(
            secondAccount ? [] : [{ activity_date: "9999-12-02" }],
          );
        }
        expect(url.searchParams.get("clinic_id")).toBe(`eq.${historicalId}`);
        expect(url.searchParams.get("order")).toBe("activity_date.desc,id.asc");
        expect(url.searchParams.get("select")).toContain(
          "activity_key:id::text",
        );
        return Response.json([
          {
            activity_key: activeId,
            clinic_key: historicalId,
            activity_date: "9999-12-31",
            description: null,
            calculation_mode: "direct",
            price: exact,
            gross: "-0.10",
            net: "-0.09",
            applied_percentage: "30.5000",
            applied_irpf: "15",
          },
        ]);
      });
    vi.stubGlobal("fetch", fetch);

    const period = { year: 9999, month: 12 };
    const first = await readActivity(period, historicalId, undefined);
    expect(first?.scope.clinicId).toBe(historicalId);
    expect(first?.clinicOptions.map(({ id }) => id)).toEqual([
      activeId,
      historicalId,
    ]);
    expect(first?.rows).toMatchObject([
      {
        id: activeId,
        date: "9999-12-31",
        priceCents: "900719925474099327",
        grossCents: "-10",
        netCents: "-9",
        appliedPercentageBasisPoints: 3050,
      },
    ]);
    expect(first?.totals.priceCents).toBe("900719925474099327");
    expect(first?.lastEntered).toBe("9999-12-02");
    const laterSession = fixtureSession(7200, "second-account");
    session = {
      ...laterSession,
      user: { id: "second-owner", email: "second@example.test" },
    };
    storeSession(session);
    const second = await readActivity(period, historicalId, undefined);
    expect(second).toMatchObject({
      scope: { clinicId: null },
      rows: [],
      clinicOptions: [],
      totals: { rowCount: 0, priceCents: "0", grossCents: "0", netCents: "0" },
      lastEntered: undefined,
    });
    expect(calls).toEqual(["all", historicalId, "all"]);
  });

  it("fills each activity page past the API response cap and retains complete totals", async () => {
    const session = fixtureSession(3600, "fixture-refresh");
    storeSession(session);
    const offsets: number[] = [];
    let fail = true;
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
        const url = new URL(String(input));
        if (url.pathname === "/auth/v1/user")
          return Response.json(session.user);
        if (url.pathname === "/rest/v1/clinics")
          return Response.json(
            url.searchParams.has("id")
              ? []
              : [
                  {
                    clinic_key: "1",
                    name: "Test clinic",
                    active: true,
                    percentage: "0",
                  },
                ],
          );
        if (url.pathname.endsWith("/activity_period_totals"))
          return Response.json({
            price: "103.00",
            gross: "0",
            net: "0",
            row_count: "103",
            clinics: [{ clinic_id: "1" }],
          });
        expect(url.pathname).toBe("/rest/v1/activity");
        if (url.searchParams.get("select") === "activity_date")
          return Response.json([{ activity_date: "2026-12-01" }]);
        const offset = Number(url.searchParams.get("offset"));
        const limit = Number(url.searchParams.get("limit"));
        offsets.push(offset);
        if (fail)
          return Response.json(
            { message: "Fixture read failure" },
            { status: 400 },
          );
        return Response.json(
          Array.from(
            { length: Math.min(limit, 2, 103 - offset) },
            (_, index) => ({
              activity_key: String(
                BigInt("9007199254740993") + BigInt(offset + index),
              ),
              clinic_key: "1",
              activity_date: "2026-12-31",
              description: null,
              calculation_mode: "percentage",
              price: "1",
              gross: "0",
              net: "0",
              applied_percentage: "0",
              applied_irpf: "15",
            }),
          ),
        );
      }),
    );
    const period = { year: 2026, month: 12 };
    await expect(readActivity(period, "1", "3")).resolves.toBeNull();
    fail = false;
    const result = await readActivity(period, "1", "3");
    expect(result).toMatchObject({
      scope: { clinicId: "1" },
      page: 3,
      pageCount: 3,
      totals: { rowCount: 103, priceCents: "10300" },
    });
    expect(offsets).toEqual([100, 100, 102]);
    expect(result?.rows.map(({ id }) => id)).toEqual([
      "9007199254741093",
      "9007199254741094",
      "9007199254741095",
    ]);
  });

  it("writes only validated activity inputs through the verified owner's RPC", async () => {
    const session = fixtureSession(3600, "activity-refresh");
    storeSession(session);
    const payloads: unknown[] = [];
    const clinicId = "9007199254740993";
    const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
      const url = new URL(String(input));
      expect(new Headers(init?.headers).get("authorization")).toBe(
        `Bearer ${session.access_token}`,
      );
      if (url.pathname === "/auth/v1/user") return Response.json(session.user);
      expect(url.pathname).toBe("/rest/v1/rpc/create_activity");
      const payload = JSON.parse(String(init?.body));
      payloads.push(payload);
      return payload.p_clinic_id === clinicId
        ? Response.json("9007199254740995")
        : Response.json(
            { code: "42501", message: "Clinic is unavailable" },
            { status: 403 },
          );
    });
    vi.stubGlobal("fetch", fetch);

    const target = { month: "2026-12" };
    const owner = session.user.id;
    const draft = {
      date: "2026-12-01",
      clinicId,
      description: null,
      calculationMode: "percentage",
      priceCents: "-900719925474099327",
      directCents: null,
      appliedPercentageBasisPoints: 9999,
      grossCents: "99999",
    };
    await expect(
      saveActivity(target, owner, { ...draft, date: "2027-01-01" }),
    ).resolves.toBe("invalid");
    await expect(
      saveActivity(target, owner, { ...draft, directCents: "0" }),
    ).resolves.toBe("invalid");
    await expect(
      saveActivity(target, owner, { ...draft, clinicId: null }),
    ).resolves.toBe("invalid");
    await expect(saveActivity(target, "previous-owner", draft)).resolves.toBe(
      "session-changed",
    );
    expect(payloads).toEqual([]);

    await expect(saveActivity(target, owner, draft)).resolves.toBe("saved");
    await expect(
      saveActivity(target, owner, {
        ...draft,
        calculationMode: "direct",
        priceCents: "0",
        directCents: "0",
      }),
    ).resolves.toBe("saved");
    await expect(
      saveActivity(target, owner, { ...draft, clinicId: "22" }),
    ).resolves.toBe("clinic-unavailable");
    expect(payloads).toEqual([
      {
        p_clinic_id: clinicId,
        p_activity_date: draft.date,
        p_description: null,
        p_price: "-9007199254740993.27",
        p_calculation_mode: "percentage",
        p_direct_amount: null,
      },
      {
        p_clinic_id: clinicId,
        p_activity_date: draft.date,
        p_description: null,
        p_price: "0.00",
        p_calculation_mode: "direct",
        p_direct_amount: "0.00",
      },
      {
        p_clinic_id: "22",
        p_activity_date: draft.date,
        p_description: null,
        p_price: "-9007199254740993.27",
        p_calculation_mode: "percentage",
        p_direct_amount: null,
      },
    ]);
  });

  it("passes only editable values and the exact row ID to the owner RPCs", async () => {
    const session = fixtureSession(3600, "activity-correction-refresh");
    storeSession(session);
    const id = "9007199254740995";
    const calls: [string, unknown][] = [];
    const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
      const { pathname } = new URL(String(input));
      expect(new Headers(init?.headers).get("authorization")).toBe(
        `Bearer ${session.access_token}`,
      );
      if (pathname === "/auth/v1/user") return Response.json(session.user);
      const body = JSON.parse(String(init?.body));
      calls.push([pathname, body]);
      return body.p_id === id
        ? Response.json(id)
        : Response.json(
            { code: "42501", message: "Activity is unavailable" },
            { status: 403 },
          );
    });
    vi.stubGlobal("fetch", fetch);

    const owner = session.user.id;
    const draft = {
      date: "2022-01-28",
      clinicId: "9007199254740993",
      description: "  Corrección  ",
      calculationMode: "direct",
      priceCents: "-12000",
      directCents: "-802",
      appliedPercentageBasisPoints: 9999,
      appliedIrpfBasisPoints: 9999,
    };
    await expect(saveActivity({ id }, "previous-owner", draft)).resolves.toBe(
      "session-changed",
    );
    await expect(deleteActivity(id, "previous-owner")).resolves.toBe(
      "session-changed",
    );
    await expect(deleteActivity("9223372036854775808", owner)).resolves.toBe(
      "invalid",
    );
    expect(calls).toEqual([]);

    await expect(saveActivity({ id }, owner, draft)).resolves.toBe("saved");
    await expect(deleteActivity(id, owner)).resolves.toBe("saved");
    expect(calls).toEqual([
      [
        "/rest/v1/rpc/update_activity",
        {
          p_id: id,
          p_clinic_id: draft.clinicId,
          p_activity_date: draft.date,
          p_description: "Corrección",
          p_price: "-120.00",
          p_calculation_mode: "direct",
          p_direct_amount: "-8.02",
        },
      ],
      ["/rest/v1/rpc/delete_activity", { p_id: id }],
    ]);
    await expect(saveActivity({ id: "7" }, owner, draft)).resolves.toBe(
      "edit-unavailable",
    );
    await expect(deleteActivity("7", owner)).resolves.toBe(
      "activity-unavailable",
    );
  });

  it("forwards the verified session token and ignores caller-supplied and cookie user IDs", async () => {
    const session = fixtureSession(3600, "fixture-refresh");
    storeSession({
      ...session,
      user: { ...session.user, id: "unverified-cookie-user" },
    });
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockImplementation(async (input, init) => {
        const url = new URL(String(input));
        expect(new Headers(init?.headers).get("authorization")).toBe(
          `Bearer ${session.access_token}`,
        );
        if (url.pathname === "/auth/v1/user")
          return Response.json(session.user);
        expect(url.pathname).toBe("/rest/v1/clinics");
        if (init?.method === "GET") return Response.json([]);
        if (init?.method === "PATCH") {
          expect(JSON.parse(String(init.body))).not.toHaveProperty("owner_id");
          return Response.json([{ id: "1" }]);
        }
        expect(init?.method).toBe("POST");
        expect(JSON.parse(String(init?.body))).toEqual({
          name: "Fixture",
          percentage: 27,
          owner_id: session.user.id,
        });
        return new Response(null, { status: 201 });
      });
    vi.stubGlobal("fetch", fetch);

    const form = new FormData();
    form.set("name", "Fixture");
    form.set("percentage", "27");
    form.set("active", "inactive");
    form.set("owner_id", "forged-user");
    await expect(listClinics()).resolves.toEqual([]);
    await expect(createClinic(form)).resolves.toEqual({ status: "saved" });
    await expect(updateClinic("1", form)).resolves.toEqual({ status: "saved" });
    expect(
      fetch.mock.calls.map(([input]) => new URL(String(input)).pathname),
    ).toEqual([
      "/auth/v1/user",
      "/rest/v1/clinics",
      "/auth/v1/user",
      "/rest/v1/clinics",
      "/auth/v1/user",
      "/rest/v1/clinics",
    ]);
  });

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
    await expect(signOut()).resolves.toBeNull();
    expect(cookies.has(sessionCookie)).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("checks the rendered owner against the current verified session without returning an identity", async () => {
    const session = fixtureSession(3600, "returning-tab");
    const check = (owner: string) =>
      checkSession(
        new Request(`${origin}/auth/session`, {
          headers: { "X-MyClinics-Owner": owner },
        }),
      );
    expect((await check(session.user.id)).status).toBe(409);

    storeSession(session);
    const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
      expect(new URL(String(input)).pathname).toBe("/auth/v1/user");
      expect(new Headers(init?.headers).get("authorization")).toBe(
        `Bearer ${session.access_token}`,
      );
      return Response.json(session.user);
    });
    vi.stubGlobal("fetch", fetch);

    const sameOwner = await check(session.user.id);
    expect(sameOwner.status).toBe(204);
    expect(sameOwner.headers.get("cache-control")).toBe("private, no-store");
    expect(await sameOwner.text()).toBe("");
    const switchedOwner = await check("previous-owner");
    expect(switchedOwner.status).toBe(409);
    expect(await switchedOwner.text()).toBe("");

    fetch.mockResolvedValueOnce(new Response(null, { status: 503 }));
    fetch.mockResolvedValueOnce(new Response(null, { status: 503 }));
    fetch.mockResolvedValueOnce(new Response(null, { status: 503 }));
    fetch.mockResolvedValueOnce(new Response(null, { status: 503 }));
    expect((await check(session.user.id)).status).toBe(503);
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
  const cookie = storeSession(session);
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

function storeSession(session: ReturnType<typeof fixtureSession>) {
  const cookie = `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
  cookies.set(sessionCookie, cookie);
  return cookie;
}
