import { notFound } from "next/navigation";
import { Catalogue } from "../catalogue";
import { InvoiceSpecimen } from "./invoice-specimen";
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <Catalogue
      title="Facturas · Contratos"
      description="Escenarios sintéticos para validar los controles y estados de Facturas."
      sections={[
        {
          id: "invoices",
          title: "Formulario de facturas",
          description:
            "Solo desarrollo: clínicas activas e inactivas, sin plantilla, carga y fallo.",
          examples: [
            {
              id: "invoice-form",
              title: "Estados",
              content: <InvoiceSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
