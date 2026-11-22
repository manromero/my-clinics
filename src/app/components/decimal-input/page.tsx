import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { DecimalInputSpecimen } from "./decimal-input-specimen";

export const metadata: Metadata = {
  title: "DecimalInput · Decimales | MyClinics",
  description: "Importes y porcentajes con edición decimal precisa.",
};

export default function Page() {
  return (
    <Catalogue
      title="DecimalInput · Decimales"
      description="Importes y porcentajes con coma o punto decimal. Conserva lo que escribes, incluso mientras completas un número."
      sections={[
        {
          id: "decimales",
          title: "Edición decimal",
          description:
            "Hasta dos decimales, cero explícito y valores con signo. Sin redondeos ni cálculos.",
          examples: [
            {
              id: "decimal-input",
              title: "Importes, límites y estados",
              content: <DecimalInputSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
