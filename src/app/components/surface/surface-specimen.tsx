"use client";

import { useState } from "react";
import { Button } from "@/lib/components/button/button";
import { Surface } from "@/lib/components/surface/surface";

export function SurfaceSpecimen() {
  const [expanded, setExpanded] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-on-surface-variant">
        Las acciones admiten clic, Intro y Espacio. Prueba el texto largo para
        comprobar cómo se adapta el contenido.
      </p>
      <div className="rounded-2xl bg-surface-container p-3 sm:p-5">
        <Surface
          as="article"
          aria-labelledby="white-title"
          header={
            <>
              <p className="font-label text-caption font-semibold text-tertiary uppercase tracking-widest">
                Blanca · article
              </p>
              <h4 id="white-title" className="mt-2 font-headline text-title">
                Un espacio para leer
              </h4>
            </>
          }
          actions={
            <>
              <Button
                variant="secondary"
                aria-expanded={expanded}
                aria-controls="surface-long-content"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Mostrar texto breve" : "Probar texto largo"}
              </Button>
              <Button variant="secondary" onClick={() => setCount(count + 1)}>
                Acción complementaria
              </Button>
            </>
          }
        >
          <p id="surface-long-content" className="leading-7">
            {expanded
              ? "Una cabecera extensa y un contenido de varias líneas deben poder leerse con comodidad también en una pantalla estrecha. Las acciones pasan a la siguiente línea cuando necesitan más espacio. Referencia sin espacios: DocumentoDeEjemploConUnNombreExtraordinariamenteLargoParaComprobarElAjusteDelContenido2026."
              : "Cabecera, texto y acciones comparten un contenedor blanco. El título y sus niveles los decide cada pantalla."}
          </p>
        </Surface>
      </div>
      <Surface
        as="section"
        variant="tonal"
        aria-labelledby="tonal-title"
        header={
          <>
            <p className="font-label text-caption font-semibold text-tertiary uppercase tracking-widest">
              Tonal · section
            </p>
            <h4 id="tonal-title" className="mt-2 font-headline text-title">
              Información complementaria
            </h4>
          </>
        }
      >
        <p className="leading-7">
          Un fondo suave distingue este contenido sin añadir divisores. Este
          ejemplo omite las acciones; también se puede usar solo contenido.
        </p>
      </Surface>
      <Surface
        as="aside"
        variant="highlighted"
        aria-labelledby="highlight-title"
        header={
          <>
            <p className="font-label text-caption font-semibold uppercase tracking-widest">
              Destacada · aside
            </p>
            <h4 id="highlight-title" className="mt-2 font-headline text-title">
              Una idea que merece atención
            </h4>
          </>
        }
        actions={
          <Button variant="secondary" onClick={() => setCount(count + 1)}>
            Probar acción
          </Button>
        }
      >
        <p className="leading-7">
          El azul destacado conserva texto claro y foco visible. Las acciones
          siguen siendo controles independientes.
        </p>
      </Surface>
      <p role="status" className="text-sm text-on-surface-variant">
        Acciones activadas: {count}.
      </p>
      <p className="text-sm leading-6 text-on-surface-variant">
        API: Surface acepta as (div, section, article o aside), variant (white,
        tonal o highlighted), header, children y actions, además de atributos
        HTML y ARIA. Por defecto utiliza div y white.
      </p>
    </div>
  );
}
