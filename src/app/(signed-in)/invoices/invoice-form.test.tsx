import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InvoiceForm } from "./invoice-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

// Synthetic scenarios exist only in this test module, never in a runtime loader.
const clinics = [
  {
    id: "1",
    name: "Active fixture",
    active: true,
    templateName: "fixture.pdf",
  },
  { id: "2", name: "Inactive fixture", active: false, templateName: null },
];
describe("invoice interim form", () => {
  it("allows both clinic states and preserves zeros while preventing all downloads", async () => {
    const user = userEvent.setup();
    render(
      <InvoiceForm today="26/11/2026" state={{ status: "ready", clinics }} />,
    );
    await user.selectOptions(screen.getByLabelText("Clínica"), "2");
    expect(
      screen.getByRole("option", { name: "Inactive fixture · Inactiva" }),
    ).toBeEnabled();
    expect(screen.getByText(/Esta clínica no tiene plantilla/)).toBeVisible();
    await user.type(screen.getByLabelText("Número de factura"), "0016");
    expect(screen.getByLabelText("Número de factura")).toHaveValue("0016");
    expect(screen.getByLabelText("Fecha de emisión")).toHaveValue("26/11/2026");
    await user.type(screen.getByLabelText("Importe bruto"), "0,10");
    expect(screen.getByText("0,02 €")).toBeVisible();
    expect(screen.getByText("0,08 €")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Descargar factura PDF" }),
    ).toBeDisabled();
    await user.selectOptions(screen.getByLabelText("Clínica"), "1");
    expect(screen.getByText("Plantilla: fixture.pdf")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Descargar factura PDF" }),
    ).toBeDisabled();
  });
  it.each(["loading", "failure"] as const)(
    "keeps inputs and download safe during %s",
    (status) => {
      render(<InvoiceForm today="26/11/2026" state={{ status }} />);
      expect(screen.getByLabelText("Clínica")).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Descargar factura PDF" }),
      ).toBeDisabled();
      expect(
        screen.getByText("No se ha generado ningún documento."),
      ).toBeVisible();
    },
  );
});
