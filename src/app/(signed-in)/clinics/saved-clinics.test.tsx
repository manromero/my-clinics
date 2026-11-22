import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { afterEach, expect, it, vi } from "vitest";
import type { Clinic } from "@/lib/clinics/clinic";
import { deleteClinic } from "./delete-clinic";
import { listClinics } from "./list-clinics";
import { SavedClinics } from "./saved-clinics";
import { updateClinic } from "./update-clinic";

vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("./list-clinics", () => ({ listClinics: vi.fn() }));
vi.mock("./delete-clinic", () => ({ deleteClinic: vi.fn() }));
vi.mock("./update-clinic", () => ({ updateClinic: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

const clinic: Clinic = {
  id: "1",
  name: "Clínica Sintética",
  percentage: 30,
  active: true,
};
const ownerId = "verified-owner";

function prepareClinicList() {
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
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  vi.mocked(listClinics).mockResolvedValue([clinic]);
  return refresh;
}

function savedClinics() {
  return SavedClinics({ ownerId });
}

it("confirms an edit when the post-save list read fails and keeps confirmation through retry", async () => {
  const refresh = prepareClinicList();
  const update =
    Promise.withResolvers<Awaited<ReturnType<typeof updateClinic>>>();
  vi.mocked(updateClinic).mockReturnValue(update.promise);

  const user = userEvent.setup();
  const { rerender } = render(await savedClinics());
  await user.click(
    screen.getByRole("button", { name: `Editar ${clinic.name}` }),
  );
  await user.click(screen.getByRole("button", { name: "Guardar" }));

  // The action's refreshed server tree can arrive before its result.
  vi.mocked(listClinics).mockResolvedValue(null);
  rerender(await savedClinics());
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
  rerender(await savedClinics());

  expect(screen.getByText("Cambios guardados")).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Editar Clínica Actualizada" }),
  ).toBeVisible();
  expect(screen.queryByText("No se pudieron cargar las clínicas")).toBeNull();
});

it("cancels without deleting, then preserves the last clinic after a failed deletion and retries", async () => {
  prepareClinicList();
  const deletion =
    Promise.withResolvers<Awaited<ReturnType<typeof deleteClinic>>>();
  vi.mocked(deleteClinic)
    .mockReturnValueOnce(deletion.promise)
    .mockResolvedValueOnce("deleted");
  const user = userEvent.setup();
  const { rerender } = render(await savedClinics());
  await user.click(
    screen.getByRole("button", { name: `Editar ${clinic.name}` }),
  );
  const deleteButton = () =>
    screen.getByRole("button", { name: "Eliminar clínica" });
  await user.click(deleteButton());
  expect(
    screen.getByRole("dialog", { name: "Eliminar clínica" }),
  ).toHaveTextContent(clinic.name);
  await user.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(screen.getByRole("dialog", { name: "Editar clínica" })).toBeVisible();
  expect(deleteClinic).not.toHaveBeenCalled();

  await user.click(deleteButton());
  await user.click(deleteButton());
  expect(screen.getByRole("button", { name: "Eliminando…" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Eliminando…" }));
  expect(deleteClinic).toHaveBeenCalledExactlyOnceWith(clinic.id, ownerId);

  await act(async () => deletion.resolve("failed"));
  expect(screen.getByText(/para reintentar/)).toBeVisible();
  expect(screen.getByRole("heading", { name: clinic.name })).toBeVisible();
  await user.click(deleteButton());
  vi.mocked(listClinics).mockResolvedValue([]);
  rerender(await savedClinics());

  expect(deleteClinic).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByText("Clínica eliminada")).toBeVisible();
  expect(screen.getByText("Aún no hay clínicas")).toBeVisible();
});

it("returns to the current edit draft and allows deactivation when activity blocks deletion", async () => {
  prepareClinicList();
  vi.mocked(deleteClinic).mockResolvedValue("linked-activity");
  const user = userEvent.setup();
  render(await savedClinics());
  await user.click(
    screen.getByRole("button", { name: `Editar ${clinic.name}` }),
  );
  await user.type(
    screen.getByRole("textbox", { name: "Nombre de la clínica" }),
    " revisada",
  );
  await user.click(screen.getByRole("button", { name: "Eliminar clínica" }));
  await user.click(screen.getByRole("button", { name: "Eliminar clínica" }));

  expect(
    screen.getByText(/tiene actividad registrada y no se puede eliminar/),
  ).toBeVisible();
  expect(
    screen.getByRole("textbox", { name: "Nombre de la clínica" }),
  ).toHaveValue(`${clinic.name} revisada`);
  expect(screen.getByRole("radio", { name: "Inactiva" })).toBeEnabled();
  expect(screen.queryByRole("button", { name: "Eliminar clínica" })).toBeNull();
});
