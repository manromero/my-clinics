import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { EmptyStateSpecimen } from "./empty-state-specimen";

export const metadata: Metadata = {
  title: "EmptyState · Estados vacíos | MyClinics",
  description:
    "Ausencia de registros y resultados, con un siguiente paso opcional.",
};

export default function Page() {
  return (
    <Catalogue
      title="EmptyState · Estados vacíos"
      description="Una explicación clara cuando no hay contenido, con una acción contextual cuando resulte útil."
      sections={[
        {
          id: "vacios",
          title: "Ausencia de contenido",
          description:
            "Sin registros, sin coincidencias, navegación y un estado sin acción. Son ejemplos locales, sin persistencia.",
          examples: [
            {
              id: "empty-state",
              title: "EmptyState",
              content: <EmptyStateSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
