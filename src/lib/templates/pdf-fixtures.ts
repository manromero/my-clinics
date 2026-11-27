import { PDFDocument, PDFName, StandardFonts, rgb } from "pdf-lib";
import { requiredTemplateFields } from "./pdf-contract";

// Synthetic templates shared by validator/capability tests and the later output engine.
export async function templateFixture(
  options: { omit?: string; wrong?: string; encrypted?: boolean } = {},
) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText("Clínica sintética · Facturación en euros €", {
    x: 40,
    y: 790,
    size: 16,
    font,
    color: rgb(0.04, 0.3, 0.7),
  });
  page.drawText("IRPF 15% · María Muñoz · Dirección", {
    x: 40,
    y: 750,
    size: 12,
    font,
  });
  for (const [index, name] of requiredTemplateFields.entries()) {
    if (name === options.omit) continue;
    const field =
      name === options.wrong
        ? pdf.getForm().createCheckBox(name)
        : pdf.getForm().createTextField(name);
    field.addToPage(page, {
      x: 40,
      y: 650 - index * 60,
      width: 250,
      height: 30,
    });
  }
  if (options.encrypted)
    pdf.context.trailerInfo.Encrypt = pdf.context.register(
      pdf.context.obj({ Filter: PDFName.of("Standard") }),
    );
  return pdf.save();
}

export function padTemplate(bytes: Uint8Array, size: number) {
  if (size < bytes.length) throw Error("Fixture size smaller than PDF");
  const padded = new Uint8Array(size).fill(32);
  padded.set(bytes);
  return padded;
}
