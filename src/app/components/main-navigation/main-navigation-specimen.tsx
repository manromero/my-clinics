"use client";

import { useState } from "react";
import {
  MainNavigation,
  type MainDestination,
} from "@/lib/components/main-navigation/main-navigation";

export function MainNavigationSpecimen() {
  const [currentHref, setCurrentHref] = useState<MainDestination>("/activity");
  const [longLabels, setLongLabels] = useState(false);
  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-on-surface-variant">
        Pulsa un enlace o usa Tab, Mayús + Tab y Entrar. Este ejemplo cambia la
        página actual sin salir del catálogo; los enlaces conservan sus destinos
        reales.
      </p>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={longLabels}
          onChange={(event) => setLongLabels(event.target.checked)}
          className="size-4 accent-primary"
        />
        Mostrar etiquetas largas
      </label>
      <MainNavigation
        currentHref={currentHref}
        labels={
          longLabels
            ? {
                "/activity":
                  "Actividad mensual y registro de honorarios profesionales",
                "/summary": "Resumen mensual por clínica",
                "/clinics": "Clínicas y centros asociados",
                "/settings": "Ajustes de la cuenta profesional",
              }
            : undefined
        }
        onClickCapture={(event) => {
          const anchor = (event.target as HTMLElement).closest("a");
          if (
            anchor &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.shiftKey &&
            !event.altKey &&
            event.button === 0
          ) {
            event.preventDefault();
            setCurrentHref(anchor.getAttribute("href") as MainDestination);
          }
        }}
      />
      <p
        role="status"
        className="font-label text-caption text-on-surface-variant"
      >
        Destino seleccionado: {currentHref}
      </p>
      <p className="text-sm leading-6 text-on-surface-variant">
        API: currentHref acepta /activity, /summary, /clinics o /settings. Sin
        currentHref no se marca ninguna página. El consumidor determina la
        sección actual, también para rutas anidadas. labels permite ampliar
        etiquetas sin cambiar los destinos. Se admiten atributos nativos de nav,
        incluida una etiqueta accesible distinta. La distribución se adapta al
        espacio disponible y conserva siempre los cuatro enlaces.
      </p>
    </div>
  );
}
