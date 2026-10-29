import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { IconButtonSpecimen } from "./icon-button-specimen";

export const metadata: Metadata = {
  title: "IconButton · Acciones con iconos | MyClinics",
  description: "Acciones compactas con nombre accesible, tamaños y estados.",
};

export default function Page() {
  return (
    <Catalogue
      title="IconButton · Acciones con iconos"
      description="Acciones compactas con nombre accesible, tamaños y estados."
      sections={[
        {
          id: "acciones",
          title: "Acciones con iconos",
          description:
            "Iconos decorativos, nombres claros y espacio para tocar con comodidad.",
          examples: [
            {
              id: "icon-button",
              title: "IconButton · Explora sus estados",
              content: <IconButtonSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
