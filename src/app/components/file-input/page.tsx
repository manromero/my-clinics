import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { FileInputSpecimen } from "./file-input-specimen";

export const metadata: Metadata = { title: "FileInput · Archivos | MyClinics" };

export default function Page() {
  return (
    <Catalogue
      title="FileInput · Archivos"
      description="Selección nativa y arrastre disponibles a la vez, con un único archivo y validación compartida."
      sections={[
        {
          id: "archivos",
          title: "Selección y estados",
          description:
            "Prueba el teclado, arrastra archivos y reemplaza o quita la selección.",
          examples: [
            {
              id: "file-input",
              title: "Archivos locales y guardados",
              content: <FileInputSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
