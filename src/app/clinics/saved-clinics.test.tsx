import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { afterEach, expect, it, vi } from "vitest";
import type { Clinic } from "@/lib/clinics/clinic";
import { listClinics } from "./list-clinics";
import { SavedClinics } from "./saved-clinics";
import { updateClinic } from "./update-clinic";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () => ({}),
}));
vi.mock("./list-clinics", () => ({ listClinics: vi.fn() }));
vi.mock("./update-clinic", () => ({ updateClinic: vi.fn() }));

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});

it("confirms an edit when the post-save list read fails and keeps confirmation through retry", async () => {
  const clinic: Clinic = {
    id: "1",
    name: "Clínica Sintética",
    percentage: 30,
    active: true,
  };
  const refresh = vi.fn();
  vi.mocked(useRouter).mockReturnValue({
    bfcacheId: "clinics-test",
    back: vi.fn(),
    forward: vi.fn(),
    refresh,
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
  const update =
    Promise.withResolvers<Awaited<ReturnType<typeof updateClinic>>>();
  vi.mocked(updateClinic).mockReturnValue(update.promise);
  vi.mocked(listClinics).mockResolvedValue([clinic]);

  const user = userEvent.setup();
  const { rerender } = render(await SavedClinics());
  await user.click(
    screen.getByRole("button", { name: `Editar ${clinic.name}` }),
  );
  await user.click(screen.getByRole("button", { name: "Guardar" }));

  // The action's refreshed server tree can arrive before its result.
  vi.mocked(listClinics).mockResolvedValue(null);
  rerender(await SavedClinics());
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(screen.queryByText("Cambios guardados")).toBeNull();

  await act(async () => update.resolve({ status: "saved" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByText("Cambios guardados")).toBeVisible();
  expect(screen.getByText("No se pudieron cargar las clínicas")).toBeVisible();

  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(refresh).toHaveBeenCalledOnce();
  vi.mocked(listClinics).mockResolvedValue([
    { ...clinic, name: "Clínica Actualizada" },
  ]);
  rerender(await SavedClinics());

  expect(screen.getByText("Cambios guardados")).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Editar Clínica Actualizada" }),
  ).toBeVisible();
  expect(screen.queryByText("No se pudieron cargar las clínicas")).toBeNull();
});
