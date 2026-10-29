import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { ActionLinkSpecimen } from "./action-link-specimen";

export const metadata: Metadata = {
  title: "ActionLink · Navegación | MyClinics",
  description: "Enlaces de texto y navegación con apariencia de botón.",
};

export default function Page() {
  return (
    <Catalogue
      title="ActionLink · Navegación"
      description="Destinos claros con enlaces de texto, botones de navegación e iconos opcionales."
      sections={[
        {
          id: "controles",
          title: "Enlaces y destinos",
          description:
            "Navegación con la misma jerarquía visual que las acciones de MyClinics.",
          examples: [
            {
              id: "action-link",
              title: "ActionLink · Variantes y foco",
              content: <ActionLinkSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
