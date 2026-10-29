"use client";

import { useState } from "react";
import { Button } from "@/lib/components/button";

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      focusable="false"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      focusable="false"
    >
      <path d="m13 5 7 7-7 7M4 12h16" />
    </svg>
  );
}

export function ButtonSpecimen() {
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState(false);
  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-on-surface-variant">
        Activa cualquier variante con un clic, Intro o Espacio. Los iconos
        acompañan siempre a una etiqueta.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setCount(count + 1)} startIcon={<PlusIcon />}>
          Acción principal
        </Button>
        <Button variant="secondary" onClick={() => setCount(count + 1)}>
          Acción secundaria
        </Button>
        <Button
          variant="tertiary"
          onClick={() => setCount(count + 1)}
          endIcon={<ArrowIcon />}
        >
          Ver detalles
        </Button>
        <Button variant="destructive" onClick={() => setCount(count + 1)}>
          Eliminar ejemplo
        </Button>
      </div>
      <p role="status" className="text-sm text-on-surface-variant">
        Acciones activadas: {count}.
      </p>
      <h4 className="font-label text-label font-semibold">Tamaños</h4>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setCount(count + 1)}
        >
          Pequeño
        </Button>
        <Button
          size="md"
          variant="secondary"
          onClick={() => setCount(count + 1)}
        >
          Mediano
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => setCount(count + 1)}
        >
          Grande
        </Button>
      </div>
      <h4 className="font-label text-label font-semibold">Desactivados</h4>
      <div className="flex flex-wrap gap-3">
        <Button disabled>Principal desactivado</Button>
        <Button disabled variant="secondary">
          Secundario desactivado
        </Button>
        <Button disabled variant="tertiary">
          Terciario desactivado
        </Button>
        <Button disabled variant="destructive">
          Eliminar desactivado
        </Button>
      </div>
      <h4 className="font-label text-label font-semibold">
        Operación pendiente
      </h4>
      <p className="text-sm leading-6 text-on-surface-variant">
        Inicia la simulación y complétala con la acción secundaria. No se
        guardan datos.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          pending={pending}
          onClick={() => {
            setPending(true);
            setCompleted(false);
          }}
        >
          Probar operación
        </Button>
        <Button
          variant="secondary"
          disabled={!pending}
          onClick={() => {
            setPending(false);
            setCompleted(true);
          }}
        >
          Completar simulación
        </Button>
      </div>
      <p role="status" className="text-sm text-on-surface-variant">
        {pending
          ? "Operación en curso. Se impiden activaciones repetidas."
          : completed
            ? "Simulación completada. Puedes volver a probarla."
            : "Simulación preparada."}
      </p>
    </div>
  );
}
