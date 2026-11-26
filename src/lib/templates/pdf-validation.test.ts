// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { PDFDocument, PDFName } from "pdf-lib";
vi.mock("server-only", () => ({}));
import {
  validateTemplatePdf,
  requiredTemplateFields,
  templateByteLimit,
} from "./pdf-validation";

async function fixture(omit?: string, wrong?: string) {
  const document = await PDFDocument.create();
  const page = document.addPage();
  for (const name of requiredTemplateFields) {
    if (name === omit) continue;
    const field =
      name === wrong
        ? document.getForm().createCheckBox(name)
        : document.getForm().createTextField(name);
    field.addToPage(page);
  }
  return document.save();
}
describe("authoritative template byte validation", () => {
  it("recognizes the parser encryption rejection despite its ES5 Error subclass", async () => {
    const d = await PDFDocument.create();
    d.addPage();
    d.context.trailerInfo.Encrypt = d.context.register(
      d.context.obj({ Filter: PDFName.of("Standard") }),
    );
    expect(await validateTemplatePdf(await d.save())).toEqual({
      valid: false,
      reason: "encrypted",
    });
  });
  it("accepts a readable PDF with all named text fields and hashes the exact bytes", async () => {
    const bytes = await fixture();
    expect(await validateTemplatePdf(bytes)).toMatchObject({
      valid: true,
      bytes: bytes.length,
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });
  it("reports missing field names", async () => {
    expect(await validateTemplatePdf(await fixture("net_amount"))).toEqual({
      valid: false,
      reason: "missing-fields",
      fields: ["net_amount"],
    });
  });
  it("rejects a named checkbox in place of a text field", async () => {
    expect(
      await validateTemplatePdf(await fixture(undefined, "gross_amount")),
    ).toEqual({
      valid: false,
      reason: "wrong-field-type",
      fields: ["gross_amount"],
    });
  });
  it("rejects forged PDF bytes and enforces decimal MB before parsing", async () => {
    expect(await validateTemplatePdf(new Uint8Array([1, 2, 3]))).toEqual({
      valid: false,
      reason: "unreadable",
    });
    expect(
      await validateTemplatePdf(new Uint8Array(templateByteLimit + 1)),
    ).toEqual({ valid: false, reason: "too-large" });
  });
});
