"use client";

import { useState } from "react";
import { Badge } from "@/lib/components/badge/badge";
import { Button } from "@/lib/components/button/button";

function InformationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7v1" />
    </svg>
  );
}

export function BadgeSpecimen() {
  const [active, setActive] = useState(true);
  const [decoration, setDecoration] = useState(true);
  const [longLabel, setLongLabel] = useState(false);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm leading-6 text-on-surface-variant">
          Etiquetas de texto, sin acciones ni anuncios automáticos. Cada
          significado sigue siendo legible sin color.
        </p>
        <div className="flex flex-wrap items-start gap-3">
          <Badge>Neutral</Badge>
          <Badge variant="active" dot>
            Activa
          </Badge>
          <Badge variant="inactive">Inactiva</Badge>
          <Badge variant="informational" icon={<InformationIcon />}>
            Información
          </Badge>
          <Badge variant="negative">Gasto negativo</Badge>
        </div>
      </div>
      <div className="rounded-xl bg-surface-container-low p-5 sm:p-6">
        <h4 className="font-headline text-title">Ejemplos de uso</h4>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="font-medium">Clínica de ejemplo</span>
          <Badge variant={active ? "active" : "inactive"} dot={decoration}>
            {active ? "Activa" : "Inactiva"}
          </Badge>
          <Badge>5 clínicas</Badge>
          <Badge
            variant="negative"
            icon={decoration ? <span>−</span> : undefined}
          >
            Entrada negativa
          </Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-on-surface-variant">
          Muestras sin datos guardados ni cálculos. El punto del estado activo
          permanece estático.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            aria-pressed={!active}
            onClick={() => setActive(!active)}
          >
            Alternar estado de ejemplo
          </Button>
          <Button
            variant="secondary"
            aria-pressed={decoration}
            onClick={() => setDecoration(!decoration)}
          >
            Mostrar decoración
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="font-headline text-title">Texto que se adapta</h4>
        <Badge variant="informational" icon={<InformationIcon />}>
          {longLabel
            ? "Información complementaria sobre la entrada de laboratorio y su documentación pendiente de revisar"
            : "Documentación pendiente"}
        </Badge>
        <div>
          <Button
            variant="secondary"
            aria-pressed={longLabel}
            onClick={() => setLongLabel(!longLabel)}
          >
            Probar etiqueta larga
          </Button>
        </div>
      </div>
      <p className="text-sm leading-6 text-on-surface-variant">
        API: children es el texto obligatorio; variant admite neutral (por
        defecto), active, inactive, informational y negative. dot o icon añaden
        una decoración oculta a tecnologías de asistencia. Admite atributos de
        span, className y ref. Usa texto descriptivo; los iconos deben ser
        decorativos y no interactivos.
      </p>
    </div>
  );
}
