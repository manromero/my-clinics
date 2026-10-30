import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catálogo de componentes | MyClinics",
  description: "Índice de fundamentos y componentes de MyClinics.",
};

const pages = [
  {
    href: "/components/text-input",
    title: "TextInput · Entrada de texto",
    description:
      "Edición, adornos decorativos, errores y estados de campos de texto.",
  },
  {
    href: "/components/form-field",
    title: "Primitivas de campo",
    description:
      "Etiquetas, campos obligatorios y opcionales, ayuda y errores accesibles.",
  },
  {
    href: "/components/badge",
    title: "Badge · Etiquetas",
    description:
      "Estados, recuentos y avisos compactos con decoración opcional.",
  },
  {
    href: "/components/action-link",
    title: "ActionLink · Navegación",
    description:
      "Enlaces de texto, navegación con apariencia de botón e iconos opcionales.",
  },
  {
    href: "/components/surface",
    title: "Surface · Contenedores",
    description:
      "Superficies blancas, tonales y destacadas con composición flexible.",
  },
  {
    href: "/components/icon-button",
    title: "IconButton · Acciones con iconos",
    description:
      "Nombres accesibles, áreas táctiles y estados de acciones compactas.",
  },
  {
    href: "/components/foundations",
    title: "Fundamentos visuales",
    description: "Color, tipografía, superficies, espacio, foco y movimiento.",
  },
  {
    href: "/components/button",
    title: "Button · Acciones",
    description:
      "Variantes, tamaños y estados de los botones, con ejemplos interactivos.",
  },
];

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="bg-surface-container-lowest px-6 py-6 sm:px-12">
        <p className="mx-auto max-w-6xl font-label text-label font-semibold">
          MyClinics · Catálogo
        </p>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-12 sm:py-16">
        <p className="text-xs font-semibold tracking-widest text-tertiary uppercase">
          Biblioteca de interfaz
        </p>
        <h1 className="mt-4 font-headline text-headline sm:text-display">
          Catálogo de componentes
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-on-surface-variant">
          Explora los fundamentos de MyClinics y los ejemplos de cada componente
          en su propia página.
        </p>
        <nav aria-label="Páginas del catálogo" className="mt-12">
          <ul className="grid gap-6 sm:grid-cols-2">
            {pages.map((page) => (
              <li
                key={page.href}
                className="min-w-0 rounded-xl bg-surface-container-lowest p-6 sm:p-8"
              >
                <h2 className="font-headline text-2xl">
                  <Link
                    href={page.href}
                    className="inline-block rounded-sm py-2 text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    {page.title}
                  </Link>
                </h2>
                <p className="mt-3 leading-7 text-on-surface-variant">
                  {page.description}
                </p>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
