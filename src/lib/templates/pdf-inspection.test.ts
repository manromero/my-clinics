// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { PDFDocument, PDFRawStream, decodePDFRawStream } from "pdf-lib";
import { inspectTemplatePdf } from "./pdf-inspection";
import { padTemplate, templateFixture } from "./pdf-fixtures";
import { templateByteLimit } from "./pdf-contract";
vi.mock("server-only", () => ({}));
import { validateTemplatePdf } from "./pdf-validation";

describe("local and authoritative PDF contract using actual bytes", () => {
  it("agrees on valid, exact boundary, overflow, corrupt, encrypted, missing and wrong text fields", async () => {
    const valid = await templateFixture();
    const cases = [
      [valid, { valid: true }],
      [padTemplate(valid, templateByteLimit), { valid: true }],
      [
        padTemplate(valid, templateByteLimit + 1),
        { valid: false, reason: "too-large" },
      ],
      [
        new TextEncoder().encode("%PDF-corrupt"),
        { valid: false, reason: "unreadable" },
      ],
      [
        await templateFixture({ encrypted: true }),
        { valid: false, reason: "encrypted" },
      ],
      [
        await templateFixture({ omit: "net_amount" }),
        { valid: false, reason: "missing-fields", fields: ["net_amount"] },
      ],
      [
        await templateFixture({ wrong: "issue_date" }),
        { valid: false, reason: "wrong-field-type", fields: ["issue_date"] },
      ],
    ] as const;
    for (const [bytes, expected] of cases) {
      expect(await inspectTemplatePdf(bytes)).toMatchObject(expected);
      expect(await validateTemplatePdf(bytes)).toMatchObject(expected);
    }
  }, 20_000);
  it("fills accents/euro, preserves static content and page size, and flattens field appearances", async () => {
    const pdf = await PDFDocument.load(await templateFixture());
    const page = pdf.getPage(0);
    const original = page.node.Contents()?.toString();
    const form = pdf.getForm();
    form.getTextField("invoice_number").setText("0001 María Muñoz");
    form.getTextField("issue_date").setText("27/11/2026");
    for (const name of ["gross_amount", "withholding_amount", "net_amount"])
      form.getTextField(name).setText("1.234,56 €");
    form.updateFieldAppearances();
    expect(form.getTextField("invoice_number").getText()).toBe(
      "0001 María Muñoz",
    );
    const appeared = await PDFDocument.load(await pdf.save());
    const streams = appeared.context
      .enumerateIndirectObjects()
      .map(([, value]) => value)
      .filter((value) => value instanceof PDFRawStream)
      .map((value) =>
        new TextDecoder().decode(
          decodePDFRawStream(value as PDFRawStream).decode(),
        ),
      )
      .join("\n");
    expect(streams).toContain("4D6172ED61204D75F16F7A");
    expect(streams).toContain("312E3233342C35362080");
    form.flatten();
    expect(page.node.Contents()?.toString()).toContain(
      original!.slice(1, -1).trim(),
    );
    const flattened = await PDFDocument.load(await pdf.save());
    expect(flattened.getForm().getFields()).toHaveLength(0);
    expect(flattened.getPage(0).getSize()).toEqual({ width: 595, height: 842 });
  });
});
