import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { FormFieldSpecimen } from "./form-field-specimen";

export const metadata: Metadata = {
  title: "FormField · Campos de formulario | MyClinics",
  description:
    "Etiquetas, indicaciones, ayuda y errores asociados a cada control.",
};

export default function Page() {
  return (
    <Catalogue
      title="FormField · Campos de formulario"
      description="Una etiqueta clara y la información necesaria para completar cada campo, con asociaciones accesibles y espacio para leer."
      sections={[
        {
          id: "campos",
          title: "Etiquetas, ayuda y errores",
          description:
            "Ejemplos obligatorios, opcionales y con error. La validación pertenece a quien compone el formulario.",
          examples: [
            {
              id: "form-field",
              title: "Composición accesible",
              content: <FormFieldSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
