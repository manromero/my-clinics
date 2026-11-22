import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { SurfaceSpecimen } from "./surface-specimen";

export const metadata: Metadata = {
  title: "Surface · Contenedores | MyClinics",
  description:
    "Superficies blancas, tonales y destacadas con composición flexible.",
};

export default function Page() {
  return (
    <Catalogue
      title="Surface · Contenedores"
      description="El espacio y el color organizan el contenido. Sin líneas divisorias ni sombras, con márgenes que se adaptan a cada pantalla."
      sections={[
        {
          id: "superficies",
          title: "Composición y variantes",
          description:
            "Cabecera, contenido y acciones independientes. Cada contenedor conserva la semántica elegida por quien lo utiliza.",
          examples: [
            {
              id: "surface",
              title: "Surface / Card",
              content: <SurfaceSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
