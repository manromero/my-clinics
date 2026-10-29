import type { ReactNode } from "react";
import Link from "next/link";

/** Route-local registration contract. IDs are stable URL fragments. */
export type CatalogueSection = {
  id: string;
  title: string;
  description: string;
  examples: { id: string; title: string; content: ReactNode }[];
};

export function Catalogue({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: readonly CatalogueSection[];
}) {
  return (
    <div className="min-h-screen bg-surface text-on-surface [&_a]:rounded-sm [&_a]:underline-offset-4 [&_a:hover]:underline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-primary">
      <header className="bg-surface-container-lowest px-6 py-6 sm:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p className="font-label text-label font-semibold">
            MyClinics · Catálogo
          </p>
          <Link
            href="/components"
            className="px-1 py-2 text-sm font-medium text-primary"
          >
            Volver al catálogo
          </Link>
        </div>
      </header>
      <main
        id="catalogo"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16"
      >
        <p className="text-xs font-semibold tracking-widest text-tertiary uppercase">
          Biblioteca de interfaz
        </p>
        <h1 className="mt-4 font-headline text-headline sm:text-display">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-on-surface-variant">
          {description}
        </p>
        {sections.every((section) => section.examples.length === 0) && (
          <div className="mt-10 rounded-xl bg-surface-container p-6 sm:p-8">
            <h2 className="font-headline text-2xl">El catálogo está vacío</h2>
            <p className="mt-3 max-w-2xl leading-7 text-on-surface-variant">
              Todavía no hay componentes ni ejemplos disponibles. Las secciones
              están preparadas para las próximas incorporaciones.
            </p>
          </div>
        )}
        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
          <nav aria-label="Secciones del catálogo">
            <p className="text-xs font-semibold tracking-widest uppercase">
              Explorar secciones
            </p>
            <ul className="mt-4 flex flex-col items-start gap-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    className="inline-block py-2 text-sm text-primary"
                    href={`#${section.id}`}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.id}
                aria-labelledby={section.id}
                className="rounded-xl bg-surface-container-lowest p-6 sm:p-8"
              >
                <h2
                  id={section.id}
                  tabIndex={-1}
                  className="scroll-mt-6 font-headline text-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {section.title}
                </h2>
                <p className="mt-3 leading-7 text-on-surface-variant">
                  {section.description}
                </p>
                {section.examples.length === 0 ? (
                  <p className="mt-5 text-sm text-on-surface-variant">
                    Sin ejemplos todavía.
                  </p>
                ) : (
                  section.examples.map((example) => (
                    <div key={example.id} className="mt-6">
                      <h3
                        id={`${section.id}-${example.id}`}
                        className="mb-4 font-label text-label font-semibold"
                      >
                        {example.title}
                      </h3>
                      {example.content}
                    </div>
                  ))
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
