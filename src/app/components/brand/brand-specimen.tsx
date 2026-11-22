"use client";

import { useState } from "react";
import { Brand } from "@/lib/components/brand/brand";

export function BrandSpecimen() {
  const [compact, setCompact] = useState(false);
  const [description, setDescription] = useState(true);
  const [linked, setLinked] = useState(false);
  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-surface-container-low p-5">
        <p className="mb-4 font-label text-caption text-on-surface-variant">
          Cabecera · identidad completa
        </p>
        <Brand description />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <Brand variant="compact" />
        <p className="text-sm text-on-surface-variant">
          Compacta · solo marca dental
        </p>
      </div>
      <fieldset className="space-y-4">
        <legend className="mb-4 font-label text-label font-semibold">
          Configurar ejemplo
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={compact}
              onChange={(event) => setCompact(event.target.checked)}
              className="size-4 accent-primary"
            />
            Compacta
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={description}
              onChange={(event) => setDescription(event.target.checked)}
              className="size-4 accent-primary"
            />
            Descripción
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={linked}
              onChange={(event) => setLinked(event.target.checked)}
              className="size-4 accent-primary"
            />
            Enlace al catálogo
          </label>
        </div>
        <div className="rounded-xl bg-surface-container-low p-5">
          <Brand
            variant={compact ? "compact" : "full"}
            description={description}
            href={linked ? "/components" : undefined}
          />
        </div>
      </fieldset>
      <p className="text-sm leading-6 text-on-surface-variant">
        API: variant acepta full (por defecto) o compact. description muestra el
        texto español opcional; en compact se conserva como descripción
        accesible. href convierte la identidad en un enlace al destino elegido;
        sin href no hay navegación ni parada de teclado. El nombre accesible
        siempre es MyClinics. Activa el enlace y usa Tab y Entrar para volver al
        catálogo.
      </p>
      <p className="text-sm leading-6 text-on-surface-variant">
        La marca dental es un SVG integrado y decorativo, compartido por ambas
        variantes, sin fuentes de iconos ni descargas externas.
      </p>
    </div>
  );
}
