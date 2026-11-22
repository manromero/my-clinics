import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { DateInputSpecimen } from "./date-input-specimen";

export const metadata: Metadata = {
  title: "DateInput · Fechas | MyClinics",
  description: "Fechas de calendario accesibles con selector nativo.",
};

export default function Page() {
  return (
    <Catalogue
      title="DateInput · Fechas"
      description="Elige una fecha de calendario. La presentación depende del navegador; el valor conserva siempre el mismo día."
      sections={[
        {
          id: "fechas",
          title: "Fechas y estados",
          description:
            "Selector nativo, límites configurables y validación junto al campo.",
          examples: [
            {
              id: "date-input",
              title: "Edición y validación",
              content: <DateInputSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
