"use client";

import { useState } from "react";
import { Button } from "@/lib/components/button/button";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { Surface } from "@/lib/components/surface/surface";

export function PageContainerSpecimen() {
  const [wide, setWide] = useState(false);
  return (
    <>
      <PageContainer>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="secondary"
            aria-pressed={wide}
            aria-controls="composition"
            onClick={() => setWide(!wide)}
          >
            {wide ? "Mostrar contenido estrecho" : "Mostrar contenido amplio"}
          </Button>
          <p role="status" className="text-sm text-on-surface-variant">
            {wide
              ? "Contenido amplio: tres columnas adaptables."
              : "Contenido estrecho: lectura breve."}
          </p>
        </div>
      </PageContainer>
      <div className="bg-surface-container-low">
        <PageContainer
          as="section"
          id="composition"
          aria-labelledby="composition-title"
          aria-describedby="composition-help"
        >
          <div className="mb-8 max-w-2xl">
            <p className="font-label text-caption font-semibold uppercase tracking-widest text-tertiary">
              section · Composición semántica
            </p>
            <h2
              id="composition-title"
              className="mt-3 font-headline text-headline"
            >
              Un marco, muchas posibilidades
            </h2>
            <p
              id="composition-help"
              className="mt-4 leading-7 text-on-surface-variant"
            >
              El contenido define su propia distribución. El marco conserva los
              márgenes y el espacio vertical, sin añadir títulos ni superficies.
            </p>
          </div>
          {wide ? (
            <div className="grid min-w-0 gap-6 md:grid-cols-3">
              {[
                "Leer con claridad",
                "Espacio para organizar",
                "También en el móvil",
              ].map((title, index) => (
                <Surface
                  key={title}
                  as="article"
                  header={<h3 className="font-headline text-title">{title}</h3>}
                >
                  <p className="leading-7">
                    {index === 1
                      ? "ReferenciaSinEspaciosParaComprobarQueElContenidoSeAjustaSinDesbordarLaPantallaInclusoEnUnDispositivoEstrecho2026"
                      : "Las columnas se apilan cuando falta espacio. Los textos y los enlaces conservan su orden natural."}
                  </p>
                  <a
                    href="#api"
                    className="mt-4 inline-block py-2 text-primary underline underline-offset-4"
                  >
                    Consultar API
                  </a>
                </Surface>
              ))}
            </div>
          ) : (
            <Surface
              className="max-w-xl"
              header={
                <h3 className="font-headline text-title">
                  Una lectura tranquila
                </h3>
              }
            >
              <p className="leading-7">
                Un bloque estrecho puede convivir con el ancho compartido de la
                página. Su tamaño lo decide el contenido.
              </p>
              <a
                href="#api"
                className="mt-4 inline-block py-2 text-primary underline underline-offset-4"
              >
                Consultar API
              </a>
            </Surface>
          )}
        </PageContainer>
      </div>
    </>
  );
}
