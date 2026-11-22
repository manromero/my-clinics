import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { AlertSpecimen } from "./alert-specimen";

export const metadata: Metadata = {
  title: "Alert · Mensajes | MyClinics",
  description:
    "Ayuda contextual, avisos y resultados de operaciones con acciones opcionales.",
};

export default function Page() {
  return (
    <Catalogue
      title="Alert · Mensajes"
      description="Mensajes claros que explican el contexto y el resultado de una acción, con anuncios solo cuando hacen falta."
      sections={[
        {
          id: "mensajes",
          title: "Contexto y resultados",
          description:
            "Cuatro tonos, ayuda estática y una operación simulada con reintento.",
          examples: [
            {
              id: "alert",
              title: "Alert / StatusMessage",
              content: <AlertSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
