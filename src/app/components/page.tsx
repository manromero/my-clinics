import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catálogo de componentes | MyClinics",
  description: "Índice de fundamentos y componentes de MyClinics.",
};

const pages = [
  {
    href: "/components/app-footer",
    title: "AppFooter · Pie de aplicación",
    description: "Identidad, información y enlaces adaptables.",
  },
  {
    href: "/components/app-header",
    title: "AppHeader · Cabecera de aplicación",
    description:
      "Cabecera pública, navegación y acciones de cuenta adaptables.",
  },
  {
    href: "/components/page-header",
    title: "PageHeader · Cabeceras",
    description: "Títulos, contexto opcional y acciones o filtros adaptables.",
  },
  {
    href: "/components/page-container",
    title: "PageContainer · Marco de página",
    description:
      "Ancho compartido, márgenes adaptables y composición semántica.",
  },
  {
    href: "/components/user-menu",
    title: "UserMenu · Cuenta",
    description:
      "Acciones de cuenta, teclado, espera y reintento en escritorio y móvil.",
  },
  {
    href: "/components/user-identity",
    title: "UserIdentity · Identidad personal",
    description:
      "Nombre, correo, avatar y zona horaria en formato completo o compacto.",
  },
  {
    href: "/components/main-navigation",
    title: "MainNavigation · Navegación principal",
    description:
      "Cuatro destinos, página actual, teclado y distribución adaptable.",
  },
  {
    href: "/components/brand",
    title: "Brand · Identidad",
    description:
      "Marca dental, presentación completa y compacta, y navegación opcional.",
  },
  {
    href: "/components/confirm-dialog",
    title: "ConfirmDialog · Confirmaciones",
    description: "Confirmación segura, eliminación, espera y reintento.",
  },
  {
    href: "/components/form-panel",
    title: "FormPanel · Formularios",
    description: "Panel y modal con guardado, cancelación y reintento.",
  },
  {
    href: "/components/dialog",
    title: "Dialog · Diálogos",
    description: "Foco modal, contenido desplazable y cierre configurable.",
  },
  {
    href: "/components/empty-state",
    title: "EmptyState · Estados vacíos",
    description:
      "Sin registros, sin coincidencias y un siguiente paso opcional.",
  },
  {
    href: "/components/loading-state",
    title: "LoadingState · Carga",
    description: "Texto anunciado, regiones ocupadas y movimiento reducido.",
  },
  {
    href: "/components/alert",
    title: "Alert · Mensajes",
    description:
      "Ayuda, avisos y resultados de operaciones con reintento opcional.",
  },
  {
    href: "/components/segmented-control",
    title: "SegmentedControl · Selección exclusiva",
    description:
      "Opciones de formulario agrupadas, teclado y estados desactivados.",
  },
  {
    href: "/components/select",
    title: "Select · Selección",
    description:
      "Selección única, opciones agrupadas y estados con selector nativo.",
  },
  {
    href: "/components/date-input",
    title: "DateInput · Fechas",
    description: "Fechas de calendario, límites y estados con selector nativo.",
  },
  {
    href: "/components/decimal-input",
    title: "DecimalInput · Decimales",
    description:
      "Importes y porcentajes, edición con coma, precisión y límites configurables.",
  },
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
