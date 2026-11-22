"use client";

import { useState } from "react";
import { EmptyState } from "@/lib/components/empty-state/empty-state";

export function EmptyStateSpecimen() {
  const [created, setCreated] = useState(0);
  const [cleared, setCleared] = useState(0);
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <EmptyState
          headingLevel={4}
          title="Todavía no hay registros"
          explanation="Añade tu primer registro para empezar a organizar la información."
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              focusable="false"
            >
              <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h4" />
            </svg>
          }
          action={{
            label: "Añadir registro",
            onClick: () => setCreated((value) => value + 1),
          }}
        />
        <p role="status" className="text-sm text-on-surface-variant">
          Acción de ejemplo: {created}{" "}
          {created === 1 ? "activación" : "activaciones"}. No se guardan datos.
        </p>
      </div>
      <div className="space-y-3">
        <EmptyState
          headingLevel={4}
          title="No hay resultados coincidentes"
          explanation="No encontramos elementos con estos filtros. Prueba a quitarlos para ampliar la búsqueda."
          action={{
            label: "Limpiar filtros",
            onClick: () => setCleared((value) => value + 1),
          }}
        />
        <p role="status" className="text-sm text-on-surface-variant">
          Filtros limpiados: {cleared} veces en esta demostración.
        </p>
      </div>
      <EmptyState
        headingLevel={4}
        title="No hay elementos disponibles"
        explanation="Explora el catálogo para descubrir otras opciones disponibles."
        action={{ label: "Explorar el catálogo", href: "/components" }}
      />
      <EmptyState
        headingLevel={4}
        title="Nada que mostrar por ahora"
        explanation="Esta sección estará disponible cuando haya información para consultar. No necesitas realizar ninguna acción."
      />
      <p className="text-sm leading-6 text-on-surface-variant">
        API: title y explanation son textos obligatorios. icon es decoración
        opcional; no debe contener controles. action acepta label con onClick
        (botón) o href (enlace), nunca ambos. headingLevel permite h2–h6 (h2 por
        defecto) para encajar en la página; className permite ajustar la
        composición. El estado vacío no anuncia errores ni carga. Gestiona los
        cambios y sus anuncios desde la pantalla que lo utiliza.
      </p>
    </div>
  );
}
