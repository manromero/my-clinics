import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { BadgeSpecimen } from "./badge-specimen";

export const metadata: Metadata = {
  title: "Badge · Etiquetas | MyClinics",
  description: "Etiquetas compactas de estado, recuento e información.",
};

export default function Page() {
  return (
    <Catalogue
      title="Badge · Etiquetas"
      description="Pequeñas etiquetas para leer estados y contexto de un vistazo. Texto claro, tonos suaves y decoración opcional."
      sections={[
        {
          id: "etiquetas",
          title: "Variantes y contenido",
          description:
            "Cinco tratamientos visuales con significado escrito y ejemplos adaptables.",
          examples: [
            { id: "badge", title: "Badge", content: <BadgeSpecimen /> },
          ],
        },
      ]}
    />
  );
}
