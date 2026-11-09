import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PersistentClinics } from "./persistent-clinics";

const fixture = vi.hoisted(() => ({
  change: undefined as
    | ((event: string, session: { access_token: string } | null) => void)
    | undefined,
  claims: vi.fn(),
  list: vi.fn(),
  signOut: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: fixture.replace }),
}));
vi.mock("@/lib/supabase/browser-client", () => ({
  hasSupabaseBrowserConfig: () => true,
  getSupabaseBrowserClient: () => ({
    auth: {
      onAuthStateChange: (callback: typeof fixture.change) => {
        fixture.change = callback;
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                fixture.change = undefined;
              },
            },
          },
        };
      },
      getClaims: fixture.claims,
      signOut: fixture.signOut,
    },
  }),
}));
vi.mock("@/lib/clinics/browser-clinic-source", () => ({
  createBrowserClinicSource: () => ({ list: fixture.list }),
}));

const verified = {
  sub: "fixture",
  role: "authenticated",
  is_anonymous: false,
  app_metadata: { myclinics_clinic_reader: true },
};

beforeEach(() => {
  vi.resetAllMocks();
  fixture.claims.mockResolvedValue({ data: { claims: verified }, error: null });
  fixture.list.mockResolvedValue({
    status: "loaded",
    clinics: [
      { id: "1", name: "Clínica privada", percentage: 37.25, active: true },
    ],
  });
  fixture.signOut.mockResolvedValue({ error: null });
});

afterEach(cleanup);

function session(token: string | null) {
  act(() =>
    fixture.change?.(
      token ? "SIGNED_IN" : "SIGNED_OUT",
      token ? { access_token: token } : null,
    ),
  );
}

it("keeps anonymous and other accounts out, including a user-editable marker", async () => {
  fixture.claims.mockResolvedValue({
    data: {
      claims: {
        ...verified,
        app_metadata: {},
        user_metadata: { myclinics_clinic_reader: true },
      },
    },
    error: null,
  });
  render(<PersistentClinics />);
  session(null);
  expect(
    screen.getByText("Inicia sesión para ver tus clínicas"),
  ).toBeInTheDocument();
  session("denied-token");
  expect(await screen.findByText("Cuenta no autorizada")).toBeInTheDocument();
  expect(fixture.list).not.toHaveBeenCalled();
});

it("removes rendered data immediately on session loss", async () => {
  render(<PersistentClinics />);
  session("approved-token");
  expect(await screen.findByText("Clínica privada")).toBeInTheDocument();
  session(null);
  expect(screen.queryByText("Clínica privada")).not.toBeInTheDocument();
  expect(
    screen.getByText("Inicia sesión para ver tus clínicas"),
  ).toBeInTheDocument();
});

it("keeps data hidden when sign-out needs a retry", async () => {
  fixture.signOut.mockResolvedValueOnce({ error: new Error("fixture") });
  const user = userEvent.setup();
  render(<PersistentClinics />);
  session("approved-token");
  await user.click(
    await screen.findByRole("button", { name: "Cerrar sesión" }),
  );
  expect(
    await screen.findByText("No se pudo cerrar la sesión"),
  ).toBeInTheDocument();
  expect(screen.queryByText("Clínica privada")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(fixture.signOut).toHaveBeenCalledWith({ scope: "local" });
  expect(fixture.replace).toHaveBeenCalledWith("/login");
});
