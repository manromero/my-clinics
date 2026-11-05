import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { AppHeaderSpecimen } from "./app-header-specimen";

export const metadata: Metadata = {
  title: "AppHeader · Cabecera de aplicación | MyClinics",
  description: "Cabeceras pública y con sesión iniciada.",
};

export default function Page() {
  return (
    <PageContainer as="main" className="max-w-none! px-0!">
      <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-12">
        <Link
          href="/components"
          className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Volver al catálogo
        </Link>
        <h1 className="mt-2 font-headline text-headline">
          AppHeader · Cabecera de aplicación
        </h1>
      </div>
      <section
        aria-labelledby="publica"
        className="bg-surface-container-low pb-5"
      >
        <h2
          id="publica"
          className="mx-auto max-w-7xl px-4 py-3 font-label text-label font-semibold sm:px-6 lg:px-12"
        >
          Cabecera pública
        </h2>
        <AppHeader variant="public" />
      </section>
      <AppHeaderSpecimen />
      <PageContainer as="section" aria-labelledby="api">
        <h2 id="api" className="font-headline text-2xl">
          API
        </h2>
        <div className="mt-3 max-w-2xl space-y-3 text-sm leading-6 text-on-surface-variant">
          <p>
            <code>variant=&quot;public&quot;</code> muestra la marca y el
            distintivo de acceso profesional.
            <code>variant=&quot;signed-in&quot;</code> añade los cuatro destinos
            y el menú de cuenta.
            <code> brandHref</code> convierte la marca en enlace en ambas
            variantes.
          </p>
          <p>
            <code>currentHref</code> identifica el destino actual.{" "}
            <code>account</code> recibe
            <code> identity</code>, <code>onSignOut</code> y, de forma opcional,
            <code> accountLink</code>, <code>signOutPending</code> y{" "}
            <code>signOutError</code>. El consumidor controla la acción y
            comunica su estado.
          </p>
          <p>
            En pantallas estrechas la navegación se sitúa debajo de la marca y
            el avatar. Enter o Espacio abre la cuenta, Tab recorre las acciones
            y Escape devuelve el foco al botón de apertura.
          </p>
        </div>
      </PageContainer>
    </PageContainer>
  );
}
