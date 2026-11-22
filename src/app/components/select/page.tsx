import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { SelectSpecimen } from "./select-specimen";

export const metadata: Metadata = {
  title: "Select · Selección | MyClinics",
  description: "Selección única accesible con opciones y grupos nativos.",
};

export default function Page() {
  return (
    <Catalogue
      title="Select · Selección"
      description="Elige una opción con el teclado o el selector del dispositivo."
      sections={[
        {
          id: "seleccion",
          title: "Opciones y estados",
          description: "Selección única, grupos y validación junto al campo.",
          examples: [
            {
              id: "select",
              title: "Selección y validación",
              content: <SelectSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
