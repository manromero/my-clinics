import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { ClinicsPreview } from "./clinics-preview";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("keeps persistent empty lists read-only", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "loaded", clinics: [] }),
    }),
  );
  render(<ClinicsPreview initialClinics={[]} persistent />);
  expect(await screen.findByText("Aún no hay clínicas")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Nueva clínica" }),
  ).not.toBeInTheDocument();
});

it("retries persistent load failure without allowing edits to saved clinics", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "loaded",
        clinics: [
          {
            id: "9007199254740993",
            name: "Guardada",
            percentage: 37.25,
            active: false,
          },
        ],
      }),
    });
  vi.stubGlobal("fetch", fetch);
  render(<ClinicsPreview initialClinics={[]} persistent />);
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("Guardada")).toBeInTheDocument();
  expect(screen.getByText("37,25 %")).toBeInTheDocument();
  expect(screen.getByText("Inactiva")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Nueva clínica|Editar|Eliminar/ }),
  ).not.toBeInTheDocument();
  expect(fetch).toHaveBeenLastCalledWith("/api/clinics", { cache: "no-store" });
});
