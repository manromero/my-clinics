import type { Metadata } from "next";
import { Catalogue } from "../catalogue";
import { LoadingStateSpecimen } from "./loading-state-specimen";

export const metadata: Metadata = {
  title: "LoadingState · Carga | MyClinics",
  description: "Carga accesible, regiones ocupadas y movimiento reducido.",
};

export default function Page() {
  return (
    <Catalogue
      title="LoadingState · Carga"
      description="Una espera clara, con texto visible y sin porcentajes de progreso inventados."
      sections={[
        {
          id: "carga",
          title: "Feedback de carga",
          description:
            "Estados compactos y de contenido, con decoración opcional.",
          examples: [
            {
              id: "loading-state",
              title: "LoadingState",
              content: <LoadingStateSpecimen />,
            },
          ],
        },
      ]}
    />
  );
}
