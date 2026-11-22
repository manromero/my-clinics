"use client";

import { useState } from "react";
import { Button } from "@/lib/components/button/button";
import { IconButton } from "@/lib/components/icon-button/icon-button";

function Icon({ kind }: { kind: "edit" | "delete" | "previous" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      {kind === "edit" ? (
        <path d="m16 3 5 5-12 12-6 1 1-6ZM14 5l5 5" />
      ) : kind === "delete" ? (
        <>
          <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
        </>
      ) : (
        <path d={kind === "previous" ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} />
      )}
    </svg>
  );
}

export function IconButtonSpecimen() {
  const [message, setMessage] = useState("Ninguna acción activada.");
  const [page, setPage] = useState(2);
  const [pending, setPending] = useState(false);
  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-on-surface-variant">
        Cada botón requiere <code>icon</code>. Se recomienda indicar un{" "}
        <code>label</code> descriptivo para que la acción tenga un nombre
        accesible. Admite las variantes y estados de Button; la variante
        predeterminada es terciaria. Usa Tab para ver el foco e Intro o Espacio
        para activar. Estos ejemplos no modifican datos.
      </p>
      <div className="flex flex-wrap gap-6">
        {(["primary", "secondary", "tertiary", "destructive"] as const).map(
          (variant, index) => (
            <div key={variant} className="space-y-2">
              <IconButton
                variant={variant}
                label={
                  index === 3
                    ? "Eliminar ejemplo"
                    : `Editar ejemplo ${index + 1}`
                }
                icon={<Icon kind={index === 3 ? "delete" : "edit"} />}
                onClick={() =>
                  setMessage(
                    index === 3
                      ? "Eliminar ejemplo activado."
                      : `Editar ejemplo ${index + 1} activado.`,
                  )
                }
              />
              <p className="text-caption text-on-surface-variant">
                {["Principal", "Secundario", "Terciario", "Destructivo"][index]}
              </p>
            </div>
          ),
        )}
      </div>
      <p role="status" className="text-sm text-on-surface-variant">
        {message}
      </p>
      <h4 className="font-label text-label font-semibold">
        Tamaños y área táctil
      </h4>
      <div className="flex flex-wrap items-end gap-6">
        {(["sm", "md", "lg"] as const).map((size, index) => (
          <div key={size} className="space-y-2">
            <IconButton
              size={size}
              variant="secondary"
              label={`Editar ejemplo ${size}`}
              icon={<Icon kind="edit" />}
              onClick={() => setMessage(`Editar ejemplo ${size} activado.`)}
            />
            <p className="text-caption text-on-surface-variant">
              {[44, 48, 56][index]} × {[44, 48, 56][index]} px
            </p>
          </div>
        ))}
      </div>
      <h4 className="font-label text-label font-semibold">
        Navegación del ejemplo
      </h4>
      <div className="flex flex-wrap items-center gap-3">
        <IconButton
          label="Página anterior"
          icon={<Icon kind="previous" />}
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        />
        <p role="status" className="text-sm">
          Página {page} de 3
        </p>
        <IconButton
          label="Página siguiente"
          icon={<Icon kind="next" />}
          disabled={page === 3}
          onClick={() => setPage(page + 1)}
        />
      </div>
      <h4 className="font-label text-label font-semibold">
        Desactivado y pendiente
      </h4>
      <p className="text-sm leading-6 text-on-surface-variant">
        El botón desactivado no recibe foco. Inicia la simulación con el icono
        de eliminar y complétala para volver a probar. Su nombre accesible se
        conserva durante la espera.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <IconButton
          disabled
          label="Editar ejemplo desactivado"
          icon={<Icon kind="edit" />}
        />
        <IconButton
          variant="destructive"
          label="Eliminar ejemplo de prueba"
          icon={<Icon kind="delete" />}
          pending={pending}
          onClick={() => setPending(true)}
        />
        <Button
          variant="secondary"
          disabled={!pending}
          onClick={() => setPending(false)}
        >
          Completar simulación
        </Button>
      </div>
      <p role="status" className="text-sm text-on-surface-variant">
        {pending
          ? "Eliminación simulada en curso. Se impiden activaciones repetidas."
          : "Simulación preparada."}
      </p>
    </div>
  );
}
