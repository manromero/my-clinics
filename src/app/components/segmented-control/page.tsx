import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { SegmentedControlSpecimen } from "./segmented-control-specimen";

export const metadata: Metadata = {
  title: "SegmentedControl · Selección exclusiva | MyClinics",
  description: "Opciones exclusivas con teclado y estados desactivados.",
};

export default function Page() {
  return (
    <Catalogue
      title="SegmentedControl · Selección exclusiva"
      description="Opciones de formulario agrupadas con selección visible y acceso por teclado."
      sections={[
        {
          id: "seleccion",
          title: "Selección exclusiva",
          description:
            "Un grupo de opciones de formulario con una etiqueta compartida.",
          examples: [
            {
              id: "segmented-control",
              title: "Estados y modos",
              content: <SegmentedControlSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
