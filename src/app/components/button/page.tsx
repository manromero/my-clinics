import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { ButtonSpecimen } from "../button-specimen";

export const metadata: Metadata = {
  title: "Button · Acciones | MyClinics",
  description: "Variantes, tamaños y estados de los botones de MyClinics.",
};

export default function Page() {
  return (
    <Catalogue
      title="Button · Acciones"
      description="Variantes, tamaños y estados de los botones de MyClinics."
      sections={[
        {
          id: "controles",
          title: "Controles y contenedores",
          description: "Acciones para las interacciones cotidianas.",
          examples: [
            {
              id: "button",
              title: "Button · Acciones",
              content: <ButtonSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
