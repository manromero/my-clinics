"use client";

import { useState } from "react";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { Button } from "@/lib/components/button/button";
import { Badge } from "@/lib/components/badge/badge";
import { Select } from "@/lib/components/select/select";

export function PageHeaderSpecimen() {
  const [details, setDetails] = useState(true);
  const [period, setPeriod] = useState("Octubre de 2026");
  const [notice, setNotice] = useState("Ninguna acción de ejemplo activada.");
  return (
    <>
      <PageContainer
        as="section"
        id="clinic-example"
        aria-labelledby="clinic-title"
        tabIndex={-1}
        className="bg-surface-container-lowest focus-visible:outline-offset-[-4px]"
      >
        <PageHeader
          title="Gestión de clínicas y centros de colaboración profesional"
          titleId="clinic-title"
          headingLevel={2}
          eyebrow={details ? "Configuración de centros" : undefined}
          description={
            details
              ? "Organiza tus centros asociados y consulta los acuerdos de colaboración. Contenido sintético para comprobar títulos largos y acciones adaptables."
              : undefined
          }
          metadata={
            details ? (
              <>
                <Badge variant="informational">Ejercicio 2026</Badge>
                <span>Vista de demostración</span>
              </>
            ) : undefined
          }
          actions={
            <>
              <a
                href="#api"
                className="inline-flex min-h-12 max-w-full items-center justify-center rounded-lg bg-surface-container-high px-5 py-3 font-label text-label font-semibold text-primary transition-colors duration-(--duration-fast) ease-standard hover:bg-surface-dim"
              >
                Consultar API
              </a>
              <Button
                onClick={() =>
                  setNotice(
                    "Acción de nueva clínica activada. Solo demostración.",
                  )
                }
              >
                Nueva clínica de ejemplo
              </Button>
            </>
          }
        />
        <div className="mt-6">
          <Button
            variant="tertiary"
            aria-pressed={details}
            onClick={() => setDetails(!details)}
          >
            Mostrar detalles opcionales
          </Button>
        </div>
        <p role="status" className="mt-4 text-label text-on-surface-variant">
          {notice}
        </p>
      </PageContainer>
      <PageContainer as="section" aria-labelledby="monthly-title">
        <PageHeader
          title={`Resumen mensual de ${period.toLocaleLowerCase("es")} para todos los centros de colaboración`}
          titleId="monthly-title"
          headingLevel={2}
          eyebrow="Libro de registro profesional"
          description="Una composición con filtros propios del ejemplo. Cambia el periodo para actualizar el encabezado, sin cargar ni guardar datos."
          metadata={<Badge>{period}</Badge>}
          actions={
            <a
              href="#clinic-example"
              className="inline-flex min-h-11 max-w-full items-center justify-center rounded-lg py-2 font-label text-label font-semibold text-primary underline underline-offset-4 hover:decoration-2"
            >
              Volver al ejemplo de clínicas
            </a>
          }
          filters={
            <div className="w-full sm:w-72">
              <Select
                label="Periodo de ejemplo"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                options={[
                  { value: "Octubre de 2026", label: "Octubre de 2026" },
                  { value: "Noviembre de 2026", label: "Noviembre de 2026" },
                ]}
              />
            </div>
          }
        />
      </PageContainer>
      <PageContainer
        as="section"
        aria-labelledby="minimal-title"
        className="bg-surface-container-lowest"
      >
        <PageHeader
          title="Solo un título, sin contenido adicional"
          titleId="minimal-title"
          headingLevel={2}
        />
      </PageContainer>
    </>
  );
}
