import type { ReactNode } from "react";

/** Route-local registration contract. IDs are stable URL fragments. */
export type CatalogueSection = {
  id: string;
  title: string;
  description: string;
  examples: { id: string; title: string; content: ReactNode }[];
};

export const catalogueSections: CatalogueSection[] = [
  {
    id: "fundamentos",
    title: "Fundamentos visuales",
    description:
      "Color, tipografía y espaciado que darán coherencia al sistema.",
    examples: [],
  },
  {
    id: "controles",
    title: "Controles y contenedores",
    description:
      "Acciones, campos y estados para las interacciones cotidianas.",
    examples: [],
  },
  {
    id: "estructura",
    title: "Estructura de pantalla",
    description: "Navegación y composición compartida entre las pantallas.",
    examples: [],
  },
];

export function Catalogue({
  sections = catalogueSections,
}: {
  sections?: readonly CatalogueSection[];
}) {
  return (
    <div className="min-h-screen bg-[#faf9fa] text-[#1b1c1d] [&_a]:rounded-sm [&_a]:text-[#094cb2] [&_a]:underline-offset-4 [&_a:hover]:underline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#094cb2]">
      <header className="bg-white px-6 py-6 sm:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p className="text-lg font-semibold">MyClinics · Catálogo</p>
          <a href="#catalogo" className="px-1 py-2 text-sm font-medium">
            Ir al catálogo
          </a>
        </div>
      </header>
      <main
        id="catalogo"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16"
      >
        <p className="text-xs font-semibold tracking-widest text-[#6d5e00] uppercase">
          Biblioteca de interfaz
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          Catálogo de componentes
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[#434653]">
          Un espacio para explorar las piezas de MyClinics, sus variantes y sus
          estados a medida que se incorporen.
        </p>
        {sections.every((section) => section.examples.length === 0) && (
          <div className="mt-10 rounded-xl bg-[#efedee] p-6 sm:p-8">
            <h2 className="font-serif text-2xl">El catálogo está vacío</h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#434653]">
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
                    className="inline-block py-2 text-sm"
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
                className="rounded-xl bg-white p-6 sm:p-8"
              >
                <h2
                  id={section.id}
                  tabIndex={-1}
                  className="scroll-mt-6 font-serif text-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#094cb2]"
                >
                  {section.title}
                </h2>
                <p className="mt-3 leading-7 text-[#434653]">
                  {section.description}
                </p>
                {section.examples.length === 0 ? (
                  <p className="mt-5 text-sm text-[#5a5f63]">
                    Sin ejemplos todavía.
                  </p>
                ) : (
                  section.examples.map((example) => (
                    <div key={example.id} className="mt-6">
                      <h3
                        id={`${section.id}-${example.id}`}
                        className="mb-4 text-lg font-semibold"
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
