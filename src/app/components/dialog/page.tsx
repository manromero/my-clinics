import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { DialogSpecimen } from "./dialog-specimen";

export const metadata: Metadata = {
  title: "Dialog · Diálogos | MyClinics",
  description: "Diálogos modales accesibles con foco y contenido adaptable.",
};

export default function Page() {
  return (
    <Catalogue
      title="Dialog · Diálogos"
      description="Una superficie para leer y actuar sin perder el contexto. Tamaños adaptables, contenido desplazable y acciones siempre accesibles."
      sections={[
        {
          id: "dialogos",
          title: "Apertura, foco y cierre",
          description:
            "Combina ambos tamaños con contenido breve o largo y prueba las políticas de cierre.",
          examples: [
            { id: "dialog", title: "Dialog", content: <DialogSpecimen /> },
          ],
        },
      ]}
    />
  );
}
