vi.mock("./template-actions", () => ({}));
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ClinicTemplateField,
  initialTemplateDraft,
  type StoredTemplate,
  type TemplateIntent,
} from "./clinic-template-field";
import { ClinicForm } from "./clinic-form";
import { templateFixture } from "@/lib/templates/pdf-fixtures";
import {
  inspectTemplatePdf,
  type LocalPdfValidation,
} from "@/lib/templates/pdf-inspection";

function Harness({
  validate,
  stored = { id: "saved", name: "original.pdf" },
}: {
  validate: (file: File) => Promise<LocalPdfValidation>;
  stored?: StoredTemplate | null;
}) {
  const [draft, setDraft] = useState(initialTemplateDraft);
  return (
    <ClinicTemplateField
      enabled
      stored={stored ?? undefined}
      draft={draft}
      onChange={setDraft}
      validate={validate}
    />
  );
}

describe("template intent races", () => {
  it("discards rejection without letting an older validation restore its file", async () => {
    const bytes = await templateFixture();
    const queue: Array<() => Promise<void>> = [];
    render(
      <Harness
        stored={null}
        validate={(file) =>
          new Promise((resolve) =>
            queue.push(async () =>
              resolve(
                await inspectTemplatePdf(
                  file.name === "valid.pdf"
                    ? bytes
                    : new TextEncoder().encode("corrupt"),
                ),
              ),
            ),
          )
        }
      />,
    );
    const input = screen.getByLabelText("Plantilla de factura (PDF)");
    for (const name of ["valid.pdf", "corrupt.pdf"])
      fireEvent.change(input, { target: { files: [new File([name], name)] } });
    await queue[1]();
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    fireEvent.click(
      screen.getByRole("button", { name: "Descartar archivo rechazado" }),
    );
    await queue[0]();
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByText("Sin cambios en la plantilla."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Seleccionado:/)).not.toBeInTheDocument();
  });
  it("ignores older actual-byte validation after replacement and removal, and permits same-file retry", async () => {
    const valid = await templateFixture();
    const corrupt = new TextEncoder().encode("corrupt");
    const queue: Array<() => Promise<void>> = [];
    render(
      <Harness
        validate={(file) =>
          new Promise((resolve) =>
            queue.push(async () =>
              resolve(
                await inspectTemplatePdf(
                  file.name === "valid.pdf" ? valid : corrupt,
                ),
              ),
            ),
          )
        }
      />,
    );
    const input = screen.getByLabelText("Plantilla de factura (PDF)");
    const select = (name: string) =>
      fireEvent.change(input, {
        target: {
          files: [
            new File(
              [new Uint8Array(name === "valid.pdf" ? valid : corrupt)],
              name,
              {
                type: "application/pdf",
              },
            ),
          ],
        },
      });
    select("bad.pdf");
    select("valid.pdf");
    await queue[1]();
    await waitFor(() =>
      expect(screen.getByText(/Plantilla validada/)).toBeInTheDocument(),
    );
    await queue[0]();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    select("bad.pdf");
    fireEvent.click(screen.getByRole("button", { name: /Quitar archivo/ }));
    await queue[2]();
    await waitFor(() =>
      expect(screen.getByText(/Eliminación pendiente/)).toBeInTheDocument(),
    );
    select("bad.pdf");
    await queue[3]();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/No se puede leer/),
    );
    select("valid.pdf");
    await queue[4]();
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
    select("valid.pdf");
    await queue[5]();
    await waitFor(() =>
      expect(screen.getByText(/Plantilla validada/)).toBeInTheDocument(),
    );
    expect(screen.getByText("Seleccionado: valid.pdf")).toBeInTheDocument();
  });
});

describe("optional rejected template recovery in the actual clinic form", () => {
  beforeEach(() => {
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
  });
  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
    Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  });
  it.each(["create", "pending-removal"] as const)(
    "preserves populated inputs and %s intent through discard and save",
    async (mode) => {
      const save = vi
        .fn<
          (
            data: FormData,
            intent: TemplateIntent,
          ) => Promise<{ status: "saved" }>
        >()
        .mockResolvedValue({ status: "saved" });
      const onSaved = vi.fn();
      const realSave = vi.fn();
      render(
        <ClinicForm
          clinic={
            mode === "pending-removal"
              ? { id: "demo", name: "Original", percentage: 40, active: true }
              : undefined
          }
          save={realSave}
          templateDemo={{
            stored:
              mode === "pending-removal"
                ? { id: "saved", name: "original.pdf" }
                : undefined,
            save,
          }}
          onSaved={onSaved}
          onCancel={() => {}}
        />,
      );
      fireEvent.change(screen.getByLabelText("Nombre de la clínica"), {
        target: { value: "Clínica conservada" },
      });
      fireEvent.change(screen.getByLabelText("Porcentaje por defecto"), {
        target: { value: "35" },
      });
      if (mode === "pending-removal")
        fireEvent.click(screen.getByRole("button", { name: /Quitar archivo/ }));
      const file = new File(["corrupt"], "corrupt.pdf", {
        type: "application/pdf",
      });
      Object.defineProperty(file, "arrayBuffer", {
        value: async () => new TextEncoder().encode("corrupt").buffer,
      });
      fireEvent.change(screen.getByLabelText("Plantilla de factura (PDF)"), {
        target: { files: [file] },
      });
      await waitFor(() =>
        expect(screen.getByRole("alert")).toHaveTextContent(/No se puede leer/),
      );
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
      expect(save).not.toHaveBeenCalled();
      fireEvent.click(
        screen.getByRole("button", { name: "Descartar archivo rechazado" }),
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Plantilla de factura (PDF)")).toHaveFocus();
      expect(screen.getByLabelText("Nombre de la clínica")).toHaveValue(
        "Clínica conservada",
      );
      expect(screen.getByLabelText("Porcentaje por defecto")).toHaveValue("35");
      expect(
        screen.getByText(
          mode === "create"
            ? "Sin cambios en la plantilla."
            : /Eliminación pendiente/,
        ),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
      await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
      expect(save).toHaveBeenCalledOnce();
      const [data, intent] = save.mock.calls[0];
      expect(data.get("name")).toBe("Clínica conservada");
      expect(data.get("percentage")).toBe("35");
      expect(intent).toEqual({ kind: mode === "create" ? "keep" : "remove" });
      expect(realSave).not.toHaveBeenCalled();
    },
  );
});
