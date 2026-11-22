import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { BrandSpecimen } from "./brand-specimen";

export const metadata: Metadata = {
  title: "Brand · Identidad | MyClinics",
  description:
    "Marca dental, identidad completa y compacta, y navegación opcional.",
};

export default function Page() {
  return (
    <Catalogue
      title="Brand · Identidad"
      description="Una identidad reconocible en cabeceras y espacios reducidos, con nombre accesible y navegación opcional."
      sections={[
        {
          id: "identidad",
          title: "Identidad de MyClinics",
          description:
            "Marca dental azul, nombre editorial y descripción española opcional, siguiendo las cabeceras S01–S04 de Alexandria.",
          examples: [
            { id: "brand", title: "Brand", content: <BrandSpecimen /> },
          ],
        },
      ]}
    />
  );
}
