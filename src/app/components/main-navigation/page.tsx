import type { Metadata } from "next";
import { MainNavigation } from "@/lib/components/main-navigation/main-navigation";
import { Catalogue } from "../catalogue";
import { MainNavigationSpecimen } from "./main-navigation-specimen";

export const metadata: Metadata = {
  title: "MainNavigation · Navegación principal | MyClinics",
  description:
    "Destinos principales, página actual, teclado y etiquetas largas.",
};

export default function Page() {
  return (
    <Catalogue
      title="MainNavigation"
      description="Actividad, resumen, clínicas y ajustes con una página actual accesible y todos los destinos disponibles en pantallas estrechas."
      sections={[
        {
          id: "interactivo",
          title: "Navegación principal",
          description:
            "Grupo tonal de S02–S04, texto Public Sans y selección azul sin sombras ni líneas divisorias.",
          examples: [
            {
              id: "demo",
              title: "Explorar destinos",
              content: <MainNavigationSpecimen />,
            },
          ],
        },
        {
          id: "estados",
          title: "Todas las páginas actuales",
          description:
            "Cada destino conserva su enlace y solo la página actual recibe aria-current.",
          examples: [
            {
              id: "activity",
              title: "Actividad",
              content: (
                <MainNavigation
                  currentHref="/activity"
                  aria-label="Ejemplo Actividad"
                />
              ),
            },
            {
              id: "summary",
              title: "Resumen",
              content: (
                <MainNavigation
                  currentHref="/summary"
                  aria-label="Ejemplo Resumen"
                />
              ),
            },
            {
              id: "clinics",
              title: "Clínicas",
              content: (
                <MainNavigation
                  currentHref="/clinics"
                  aria-label="Ejemplo Clínicas"
                />
              ),
            },
            {
              id: "settings",
              title: "Ajustes",
              content: (
                <MainNavigation
                  currentHref="/settings"
                  aria-label="Ejemplo Ajustes"
                />
              ),
            },
            {
              id: "none",
              title: "Sin página actual",
              content: (
                <MainNavigation aria-label="Ejemplo sin página actual" />
              ),
            },
          ],
        },
      ]}
    />
  );
}
