import { ActionLink } from "@/lib/components/action-link/action-link";

function Arrow({
  back = false,
  external = false,
}: {
  back?: boolean;
  external?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      focusable="false"
    >
      <path
        d={
          external
            ? "M14 3h7v7M21 3 10 14M10 3H3v18h18v-7"
            : back
              ? "M20 12H4m6-6-6 6 6 6"
              : "M4 12h16m-6-6 6 6-6 6"
        }
      />
    </svg>
  );
}

export function ActionLinkSpecimen() {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-on-surface-variant">
        Usa <code>href</code> para indicar el destino. <code>variant</code>{" "}
        admite
        <code> text</code> (predeterminado), <code>primary</code> y{" "}
        <code>secondary</code>. Añade iconos decorativos con{" "}
        <code>startIcon</code> y <code>endIcon</code>. Los atributos de enlace y
        las opciones de Next.js se conservan. Usa Tab para ver el foco e Intro
        para navegar.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <ActionLink href="/components/foundations">Ver fundamentos</ActionLink>
        <ActionLink
          href="/components/button"
          variant="primary"
          endIcon={<Arrow />}
        >
          Explorar botones
        </ActionLink>
        <ActionLink
          href="/components/icon-button"
          variant="secondary"
          startIcon={<Arrow back />}
        >
          Ver acciones con iconos
        </ActionLink>
      </div>
      <h4 className="font-label text-label font-semibold">
        Destino dentro de la página
      </h4>
      <p className="text-sm leading-6 text-on-surface-variant">
        La presentación cambia, pero todos los ejemplos son enlaces. Abre los
        destinos internos del catálogo o salta al destino de prueba; no se
        modifican datos.
      </p>
      <div className="flex flex-wrap gap-4">
        <ActionLink href="#destino" endIcon={<Arrow />}>
          Ir al destino de prueba
        </ActionLink>
        <ActionLink href="#destino" variant="secondary" endIcon={<Arrow />}>
          Consultar el detalle del ejemplo de navegación con una etiqueta larga
        </ActionLink>
      </div>
      <h4 className="font-label text-label font-semibold">Enlace externo</h4>
      <ActionLink
        href="https://nextjs.org/docs/app/api-reference/components/link"
        target="_blank"
        rel="noopener noreferrer"
        endIcon={<Arrow external />}
      >
        Documentación de Next.js (nueva pestaña)
      </ActionLink>
      <p className="text-sm leading-6 text-on-surface-variant">
        El consumidor indica <code>target</code> y <code>rel</code>, y anuncia
        la nueva pestaña en la etiqueta. Para guardar, eliminar o ejecutar una
        acción, usa Button.
      </p>
      <div
        id="destino"
        tabIndex={-1}
        className="scroll-mt-6 rounded-lg bg-surface-container-low p-5"
      >
        <h4 className="font-headline text-title">Destino de prueba</h4>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          Has llegado al destino del enlace. Los otros ejemplos abren páginas
          del catálogo.
        </p>
        <ActionLink
          href="#controles"
          startIcon={<Arrow back />}
          className="mt-3"
        >
          Volver a los ejemplos
        </ActionLink>
      </div>
    </div>
  );
}
