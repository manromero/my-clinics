import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import {
  ClinicTemplateField,
  initialTemplateDraft,
} from "./clinic-template-field";
import { templateFixture } from "@/lib/templates/pdf-fixtures";
import {
  inspectTemplatePdf,
  type LocalPdfValidation,
} from "@/lib/templates/pdf-inspection";

function Harness({
  validate,
}: {
  validate: (file: File) => Promise<LocalPdfValidation>;
}) {
  const [draft, setDraft] = useState(initialTemplateDraft);
  return (
    <ClinicTemplateField
      enabled
      stored={{ id: "saved", name: "original.pdf" }}
      draft={draft}
      onChange={setDraft}
      validate={validate}
    />
  );
}

describe("template intent races", () => {
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
