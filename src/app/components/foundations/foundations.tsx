import type { CSSProperties } from "react";
import { MotionSpecimen } from "./motion-specimen";

/** Route-only specimens: token names refer to the CSS public API, never duplicate values. */
export const colorFamilies = [
  {
    title: "Acción y acento",
    tokens: [
      "primary",
      "primary-container",
      "on-primary",
      "tertiary",
      "tertiary-container",
      "on-tertiary-container",
    ],
  },
  {
    title: "Superficies y texto",
    tokens: [
      "surface",
      "surface-container-lowest",
      "surface-container-low",
      "surface-container",
      "surface-container-high",
      "surface-container-highest",
      "surface-dim",
      "on-surface",
      "on-surface-variant",
      "outline-variant",
    ],
  },
  {
    title: "Estado y foco",
    tokens: [
      "error",
      "error-container",
      "on-error-container",
      "success",
      "success-container",
      "warning",
      "warning-container",
      "focus",
    ],
  },
] as const;

function Colors() {
  return (
    <div className="space-y-6">
      {colorFamilies.map(({ title, tokens }) => (
        <div key={title}>
          <h4 className="mb-3 font-label text-label font-semibold">{title}</h4>
          <ul
            aria-label={title}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {tokens.map((token) => (
              <li
                key={token}
                className="min-w-0 rounded-md bg-surface-container-low p-3"
              >
                <span
                  aria-hidden="true"
                  className="mb-3 block h-12 rounded-sm"
                  style={{ backgroundColor: `var(--color-${token})` }}
                />
                <code className="break-words text-caption">{token}</code>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Typography() {
  return (
    <div className="space-y-6">
      <p className="font-headline text-headline sm:text-display">
        Claridad para cada día
      </p>
      <p className="font-headline text-headline">Noto Serif · Encabezado</p>
      <p className="font-headline text-title">Título de sección</p>
      <p className="font-body text-body">
        Inter · Un texto sereno, con espacio para leer. Información en español:
        á, é, í, ó, ú, ü, ñ, ¿qué tal?
      </p>
      <p className="font-label text-label font-semibold">
        Public Sans · Etiqueta de interfaz
      </p>
      <p className="font-label text-caption text-on-surface-variant">
        Texto auxiliar · Detalles y contexto
      </p>
    </div>
  );
}

function Surfaces() {
  return (
    <div className="rounded-xl bg-surface-dim p-4">
      <div className="rounded-lg bg-surface-container p-4">
        <div className="rounded-md bg-surface-container-low p-4">
          <div className="rounded-sm bg-surface-container-lowest p-4">
            <p className="font-headline text-title">Jerarquía sin líneas</p>
            <p className="mt-2 text-body text-on-surface-variant">
              La luz y el espacio delimitan el contenido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Geometry() {
  return (
    <div className="space-y-6">
      <ul aria-label="Escala de espacio" className="space-y-3">
        {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
          <li key={n} className="flex items-center gap-4">
            <span className="w-24 shrink-0 font-label text-caption">
              {n * 4} px · {n}
            </span>
            <span
              aria-hidden="true"
              className="block h-3 rounded-sm bg-tertiary-container"
              style={{ width: `calc(var(--spacing) * ${n})` }}
            />
          </li>
        ))}
      </ul>
      <ul aria-label="Escala de radios" className="flex flex-wrap gap-3">
        {["sm", "md", "lg", "xl", "2xl"].map((radius) => (
          <li
            key={radius}
            className="bg-surface-container px-5 py-4 font-label text-label"
            style={{ borderRadius: `var(--radius-${radius})` }}
          >
            {radius}
          </li>
        ))}
      </ul>
      <div className="rounded-xl bg-surface-container-low p-6">
        <div
          className="rounded-lg p-6 shadow-floating"
          style={
            {
              background:
                "color-mix(in srgb, var(--color-surface-container-lowest) var(--floating-opacity), transparent)",
              backdropFilter: "blur(var(--floating-blur))",
              border: "1px solid var(--ghost-border)",
            } as CSSProperties
          }
        >
          <p className="font-label text-label">
            Capa flotante · sombra difusa y borde fantasma
          </p>
        </div>
      </div>
    </div>
  );
}

function Accessibility() {
  return (
    <div className="space-y-4">
      <p className="text-body text-on-surface-variant">
        Usa Tab para ver el foco. El estado siempre incluye texto.
      </p>
      <a
        href="#fundamentos-movimiento"
        className="inline-block rounded-md bg-linear-to-r from-primary to-primary-container px-5 py-3 font-label text-label font-semibold text-on-primary"
      >
        Explorar movimiento
      </a>
      <ul aria-label="Tratamientos de estado" className="space-y-3">
        <li className="rounded-md bg-error-container p-4 text-on-error-container">
          Error · Revisa la información.
        </li>
        <li className="rounded-md bg-success-container p-4 text-success">
          Correcto · Información comprobada.
        </li>
        <li className="rounded-md bg-warning-container p-4 text-warning">
          Aviso · Hay información pendiente.
        </li>
      </ul>
    </div>
  );
}

export const foundationExamples = [
  { id: "color", title: "Paleta semántica", content: <Colors /> },
  { id: "tipografia", title: "Jerarquía tipográfica", content: <Typography /> },
  { id: "superficies", title: "Capas tonales", content: <Surfaces /> },
  {
    id: "geometria",
    title: "Espacio, radios y elevación",
    content: <Geometry />,
  },
  {
    id: "accesibilidad",
    title: "Foco y contraste",
    content: <Accessibility />,
  },
  {
    id: "movimiento",
    title: "Movimiento respetuoso",
    content: <MotionSpecimen />,
  },
];
