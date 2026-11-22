import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageContainerSpecimen } from "./page-container-specimen";

export const metadata: Metadata = {
  title: "PageContainer · Marco de página | MyClinics",
  description: "Ancho compartido, márgenes adaptables y composición semántica.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="bg-surface-container-lowest">
        <PageContainer className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-label text-label font-semibold">
            MyClinics · Catálogo
          </p>
          <Link
            href="/components"
            className="rounded-sm py-2 text-sm text-primary underline-offset-4 hover:underline"
          >
            Volver al catálogo
          </Link>
        </PageContainer>
      </header>
      <main>
        <PageContainer>
          <p className="font-label text-caption font-semibold uppercase tracking-widest text-tertiary">
            Biblioteca de interfaz
          </p>
          <h1 className="mt-4 font-headline text-headline sm:text-display">
            PageContainer · Marco de página
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-on-surface-variant">
            Un ancho común y espacio para respirar. Prueba las dos composiciones
            y cambia el tamaño de la ventana para comparar los márgenes.
          </p>
        </PageContainer>
        <PageContainerSpecimen />
        <PageContainer
          as="section"
          id="api"
          aria-labelledby="api-title"
          tabIndex={-1}
        >
          <h2 id="api-title" className="font-headline text-title">
            API y uso
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-on-surface-variant">
            PageContainer acepta children, as (div por defecto, main, section o
            article), className y atributos HTML y ARIA. Utiliza main solo
            cuando sea el contenido principal único de la página; las secciones
            reciben su nombre del contenido.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-on-surface-variant">
            Ancho máximo: 80 rem. Márgenes interiores: 1 rem en móvil, 1,5 rem
            desde 40 rem y 3 rem desde 64 rem. Espacio vertical: 2 rem. La
            composición interior y las superficies pertenecen al contenido.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-xl bg-surface-container p-4 text-sm">
            <code>
              {
                '<PageContainer as="main" aria-labelledby="title">\n  <h1 id="title">Título de página</h1>\n  {children}\n</PageContainer>'
              }
            </code>
          </pre>
        </PageContainer>
      </main>
    </div>
  );
}
