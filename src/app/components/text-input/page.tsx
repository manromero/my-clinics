import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { TextInputSpecimen } from "./text-input-specimen";

export const metadata: Metadata = {
  title: "TextInput · Entrada de texto | MyClinics",
  description: "Campos de texto accesibles y estados de edición.",
};

export default function Page() {
  return (
    <Catalogue
      title="TextInput · Entrada de texto"
      description="Texto libre, etiquetas claras y ayuda junto al campo. Prueba la edición con teclado y la recuperación de errores."
      sections={[
        {
          id: "texto",
          title: "Texto y estados",
          description:
            "Campos nativos con foco visible, adornos decorativos y valores que se conservan al validar.",
          examples: [
            {
              id: "text-input",
              title: "Edición y validación",
              content: <TextInputSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
