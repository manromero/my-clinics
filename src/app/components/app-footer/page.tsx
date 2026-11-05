import type { Metadata } from "next";
import { ActionLink } from "@/lib/components/action-link/action-link";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { PageContainer } from "@/lib/components/page-container/page-container";

export const metadata: Metadata = {
  title: "AppFooter · Pie de aplicación | MyClinics",
  description: "Pie de aplicación compacto o con información y enlaces.",
};

export default function Page() {
  return (
    <main>
      <PageContainer className="pb-6!">
        <ActionLink href="/components">Volver al catálogo</ActionLink>
        <h1 className="mt-2 font-headline text-headline">
          AppFooter · Pie de aplicación
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Identidad de aplicación y recursos de navegación en una superficie
          tonal discreta.
        </p>
      </PageContainer>
      <section aria-labelledby="compacto">
        <PageContainer className="py-3!">
          <h2 id="compacto" className="font-label text-label font-semibold">
            Pie compacto
          </h2>
        </PageContainer>
        <AppFooter identity="MyClinics · Espacio de demostración" />
      </section>
      <section aria-labelledby="con-enlaces" className="mt-4">
        <PageContainer className="py-3!">
          <h2 id="con-enlaces" className="font-label text-label font-semibold">
            Pie con información y enlaces
          </h2>
        </PageContainer>
        <AppFooter
          identity="MyClinics · Espacio de demostración"
          metadata="Edición de muestra para el catálogo de componentes"
          navigation={{
            label: "Recursos de la demostración",
            links: [
              { href: "#api", label: "Uso del componente" },
              { href: "/components/foundations", label: "Fundamentos" },
              { href: "/components", label: "Índice de componentes" },
            ],
          }}
        />
      </section>
      <PageContainer as="section" aria-labelledby="api">
        <h2 id="api" tabIndex={-1} className="font-headline text-2xl">
          API
        </h2>
        <div className="mt-3 max-w-2xl space-y-3 text-sm leading-6 text-on-surface-variant">
          <p>
            <code>identity</code> es el texto de identidad de la aplicación.
            Puedes añadir información breve con <code>metadata</code>.
          </p>
          <p>
            <code>navigation</code> agrupa los enlaces. Su <code>label</code> da
            nombre a la región de navegación y cada elemento de{" "}
            <code>links</code> recibe <code>href</code> y <code>label</code>.
            Sin enlaces, el contenido se centra. Con enlaces, el grupo se coloca
            debajo del texto en pantallas estrechas.
          </p>
          <p>Usa Tab para recorrer los enlaces y Enter para seguirlos.</p>
        </div>
      </PageContainer>
    </main>
  );
}
