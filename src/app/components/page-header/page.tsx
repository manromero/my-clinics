import type { Metadata } from "next";
import { ActionLink } from "@/lib/components/action-link/action-link";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { PageHeaderSpecimen } from "./page-header-specimen";

export const metadata: Metadata = {
  title: "PageHeader · Cabeceras | MyClinics",
  description: "Jerarquía editorial, contexto opcional y controles adaptables.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="bg-surface-container-lowest">
        <PageContainer className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-label text-label font-semibold">
            MyClinics · Catálogo
          </p>
          <ActionLink href="/components">Volver al catálogo</ActionLink>
        </PageContainer>
      </header>
      <main>
        <PageContainer>
          <PageHeader
            title="PageHeader · Cabeceras"
            eyebrow="Biblioteca de interfaz"
            description="Títulos con espacio para respirar. Prueba las acciones y los filtros, oculta el contexto y compara la composición en una ventana estrecha."
          />
        </PageContainer>
        <PageHeaderSpecimen />
        <PageContainer
          as="section"
          id="api"
          aria-labelledby="api-title"
          tabIndex={-1}
          className="focus-visible:outline-offset-[-4px]"
        >
          <h2 id="api-title" className="font-headline text-title">
            API y uso
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-on-surface-variant">
            title es el texto obligatorio. headingLevel elige h1–h6 (h1 por
            defecto) y titleId permite nombrar la sección que lo contiene.
            Mantén un h1 por página y el orden de encabezados al componer
            secciones.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-on-surface-variant">
            eyebrow, description y metadata aceptan contenido opcional. actions
            y filters reciben controles con sus propias etiquetas, estados e
            interacciones. La cabecera los distribuye y permite que se ajusten
            al ancho disponible; no gestiona sus datos. Acepta className y
            atributos HTML y ARIA del header.
          </p>
          <pre
            role="region"
            aria-label="Ejemplo de código"
            tabIndex={0}
            className="mt-6 overflow-x-auto rounded-xl bg-surface-container p-4 text-sm"
          >
            <code>
              {
                '<PageHeader\n  title="Resumen mensual"\n  headingLevel={2}\n  titleId="summary-title"\n  metadata={<Badge>Octubre 2026</Badge>}\n  actions={<ActionLink href="/activity">Ver actividad</ActionLink>}\n  filters={periodControl}\n/>'
              }
            </code>
          </pre>
        </PageContainer>
      </main>
    </div>
  );
}
