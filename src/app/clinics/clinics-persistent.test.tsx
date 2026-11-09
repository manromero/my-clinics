import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { createClinicService } from "@/lib/clinics/clinic-service";
import { ClinicsPreview } from "./clinics-preview";

afterEach(() => {
  cleanup();
});

it("keeps persistent empty lists read-only", async () => {
  const source = createClinicService({
    list: async () => ({ status: "loaded", clinics: [] }),
  });
  render(<ClinicsPreview initialClinics={[]} persistentSource={source} />);
  expect(await screen.findByText("Aún no hay clínicas")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Nueva clínica" }),
  ).not.toBeInTheDocument();
});

it("retries persistent load failure without allowing edits to saved clinics", async () => {
  const list = vi
    .fn()
    .mockResolvedValueOnce({ status: "failed" })
    .mockResolvedValue({
      status: "loaded",
      clinics: [
        {
          id: "9007199254740993",
          name: "Guardada",
          percentage: 37.25,
          active: false,
        },
      ],
    });
  render(
    <ClinicsPreview
      initialClinics={[]}
      persistentSource={createClinicService({ list })}
    />,
  );
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("Guardada")).toBeInTheDocument();
  expect(screen.getByText("37,25 %")).toBeInTheDocument();
  expect(screen.getByText("Inactiva")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Nueva clínica|Editar|Eliminar/ }),
  ).not.toBeInTheDocument();
  expect(list).toHaveBeenCalledTimes(2);
});
