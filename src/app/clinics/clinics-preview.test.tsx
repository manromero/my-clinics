import { StrictMode } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it } from "vitest";
import { ClinicsPreview } from "./clinics-preview";

const clinic = {
  id: "one",
  name: "Dental Alameda",
  percentage: 30,
  active: true,
};

beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = false;
      },
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value() {},
  });
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

it("retries the initial load under Strict Mode", async () => {
  const user = userEvent.setup();
  render(
    <StrictMode>
      <ClinicsPreview initialClinics={[clinic]} failure="load-error" />
    </StrictMode>,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Cargando clínicas");
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "No se pudieron cargar las clínicas",
  );
  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(screen.getByRole("status")).toHaveTextContent("Cargando clínicas");
  expect(
    await screen.findByRole("heading", { name: clinic.name }),
  ).toBeInTheDocument();
});

it("validates beside each field, creates an active clinic at zero, and rejects its duplicate", async () => {
  const user = userEvent.setup();
  render(<ClinicsPreview initialClinics={[]} />);
  await user.click(
    await screen.findByRole("button", { name: "Nueva clínica" }),
  );
  const name = screen.getByRole("textbox", { name: "Nombre de la clínica" });
  const percentage = screen.getByRole("textbox", {
    name: "Porcentaje por defecto",
  });
  await user.type(name, "  ");
  await user.type(percentage, "100,01");
  await user.click(screen.getByRole("button", { name: "Guardar" }));
  expect(name).toHaveAccessibleDescription(
    "Introduce el nombre de la clínica.",
  );
  expect(percentage).toHaveAccessibleDescription(/hasta dos decimales/);
  await user.type(name, "Dental Uno  ");
  await user.clear(percentage);
  await user.type(percentage, "0");
  await user.click(screen.getByRole("button", { name: "Guardar" }));
  fireEvent.submit(screen.getByRole("form"));
  expect(screen.getByRole("button", { name: "Guardando…" })).toBeDisabled();
  expect(
    await screen.findByRole("heading", { name: "Dental Uno" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("listitem")).toHaveTextContent("Activa");
  expect(screen.getByRole("listitem")).toHaveTextContent("0,00 %");
  expect(screen.getByRole("status")).toHaveTextContent("Clínica guardada");
  expect(screen.getByRole("button", { name: "Nueva clínica" })).toHaveFocus();

  await user.click(screen.getByRole("button", { name: "Nueva clínica" }));
  await user.type(
    screen.getByRole("textbox", { name: "Nombre de la clínica" }),
    " DENTAL UNO ",
  );
  await user.type(
    screen.getByRole("textbox", { name: "Porcentaje por defecto" }),
    "100",
  );
  await user.click(screen.getByRole("button", { name: "Guardar" }));
  expect(
    await screen.findByText("Ya existe una clínica con ese nombre."),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
});

it("cancels edits, retains changes after failure, and saves deactivation and reactivation", async () => {
  const user = userEvent.setup();
  render(<ClinicsPreview initialClinics={[clinic]} failure="save-error" />);
  const edit = await screen.findByRole("button", {
    name: `Editar ${clinic.name}`,
  });
  await user.click(edit);
  let dialog = within(screen.getByRole("dialog"));
  await user.type(
    dialog.getByRole("textbox", { name: "Nombre de la clínica" }),
    " Cancelled",
  );
  await user.click(dialog.getByRole("radio", { name: "Inactiva" }));
  await user.click(dialog.getByRole("button", { name: "Cancelar" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: clinic.name }),
  ).toBeInTheDocument();
  expect(screen.getByText("Activa", { exact: true })).toBeInTheDocument();

  await user.click(edit);
  dialog = within(screen.getByRole("dialog"));
  const name = dialog.getByRole("textbox", { name: "Nombre de la clínica" });
  const percentage = dialog.getByRole("textbox", {
    name: "Porcentaje por defecto",
  });
  const inactive = dialog.getByRole("radio", { name: "Inactiva" });
  await user.type(name, " Centro");
  await user.clear(percentage);
  await user.type(percentage, "100,00");
  await user.click(inactive);
  await user.click(dialog.getByRole("button", { name: "Guardar" }));
  expect(dialog.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  expect(await dialog.findByRole("alert")).toHaveTextContent(
    "No se pudo guardar",
  );
  expect(name).toHaveValue(`${clinic.name} Centro`);
  expect(percentage).toHaveValue("100,00");
  expect(inactive).toBeChecked();
  expect(screen.getByRole("listitem")).toHaveTextContent("30,00 %");

  await user.click(dialog.getByRole("button", { name: "Guardar" }));
  const editUpdated = await screen.findByRole("button", {
    name: `Editar ${clinic.name} Centro`,
  });
  expect(editUpdated).toHaveFocus();
  const updatedCard = within(screen.getByRole("listitem"));
  expect(updatedCard.getByRole("status")).toHaveTextContent("Clínica guardada");
  expect(
    screen.getByText("Todas las clínicas están inactivas"),
  ).toBeInTheDocument();
  expect(screen.getByRole("listitem")).toHaveTextContent("100,00 %");
  await user.click(editUpdated);
  dialog = within(screen.getByRole("dialog"));
  await user.click(dialog.getByRole("radio", { name: "Activa" }));
  await user.click(dialog.getByRole("button", { name: "Guardar" }));
  expect(await screen.findByText("Clínica guardada")).toBeInTheDocument();
  expect(screen.getByRole("listitem")).toHaveTextContent("Activa");
  expect(
    screen.queryByText("Todas las clínicas están inactivas"),
  ).not.toBeInTheDocument();
});

it("confirms with the saved name and keeps the edit draft when deletion is canceled", async () => {
  const user = userEvent.setup();
  render(<ClinicsPreview initialClinics={[clinic]} />);
  await user.click(
    await screen.findByRole("button", { name: `Editar ${clinic.name}` }),
  );
  const name = screen.getByRole("textbox", { name: "Nombre de la clínica" });
  await user.type(name, " Centro");
  const deleteButton = screen.getByRole("button", { name: "Eliminar clínica" });
  await user.click(deleteButton);
  const confirm = screen.getByRole("dialog", { name: "Eliminar clínica" });
  expect(confirm).toHaveAccessibleDescription(
    `¿Quieres eliminar «${clinic.name}»? Esta acción es permanente.`,
  );
  const cancel = within(confirm).getByRole("button", { name: "Cancelar" });
  expect(cancel).toHaveFocus();
  await user.click(cancel);
  expect(deleteButton).toHaveFocus();
  expect(name).toHaveValue(`${clinic.name} Centro`);
  await user.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(
    screen.getByRole("heading", { name: clinic.name }),
  ).toBeInTheDocument();
});

it("explains why a linked clinic cannot be deleted and still allows deactivation", async () => {
  const user = userEvent.setup();
  render(
    <ClinicsPreview initialClinics={[clinic]} linkedClinicIds={[clinic.id]} />,
  );
  const edit = await screen.findByRole("button", {
    name: `Editar ${clinic.name}`,
  });
  await user.click(edit);
  expect(screen.queryByRole("button", { name: "Eliminar clínica" })).toBeNull();
  expect(screen.getByText(/tiene actividad registrada/)).toBeInTheDocument();
  await user.click(screen.getByRole("radio", { name: "Inactiva" }));
  await user.click(screen.getByRole("button", { name: "Guardar" }));
  expect(await screen.findByText("Clínica guardada")).toBeInTheDocument();
  await user.click(edit);
  expect(screen.queryByRole("button", { name: "Eliminar clínica" })).toBeNull();
  expect(screen.getByRole("radio", { name: "Inactiva" })).toBeChecked();
});

it("blocks repeat confirmation, preserves the clinic on failure and shows the empty state on retry", async () => {
  const user = userEvent.setup();
  render(
    <ClinicsPreview
      initialClinics={[{ ...clinic, active: false }]}
      failure="delete-error"
    />,
  );
  await user.click(
    await screen.findByRole("button", { name: `Editar ${clinic.name}` }),
  );
  await user.click(screen.getByRole("button", { name: "Eliminar clínica" }));
  const confirm = within(
    screen.getByRole("dialog", { name: "Eliminar clínica" }),
  );
  await user.dblClick(
    confirm.getByRole("button", { name: "Eliminar clínica" }),
  );
  expect(confirm.getByRole("button", { name: "Eliminando…" })).toBeDisabled();
  expect(confirm.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  expect(await confirm.findByRole("alert")).toHaveTextContent(
    "La clínica se conserva",
  );
  expect(
    screen.getByRole("heading", { name: clinic.name }),
  ).toBeInTheDocument();
  await user.click(confirm.getByRole("button", { name: "Eliminar clínica" }));
  expect(
    await screen.findByRole("heading", { name: "Aún no hay clínicas" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent(
    `Se eliminó ${clinic.name}.`,
  );
  expect(
    screen.getByRole("group", { name: "Clínica eliminada" }),
  ).toHaveFocus();
  expect(screen.queryByRole("dialog")).toBeNull();
});
