"use client";
import { useState } from "react";

export function MotionSpecimen() {
  const [iteration, setIteration] = useState(0);
  return (
    <div className="space-y-4">
      <p className="text-body text-on-surface-variant">
        Entrada de 220 ms. Con movimiento reducido, el contenido aparece sin
        desplazamiento perceptible.
      </p>
      <button
        type="button"
        onClick={() => setIteration((value) => value + 1)}
        className="rounded-md bg-surface-container-high px-5 py-3 font-label text-label font-semibold text-primary transition-colors duration-(--duration-fast) ease-standard hover:bg-surface-dim"
      >
        Repetir muestra
      </button>
      <div
        key={iteration}
        className="animate-reveal rounded-lg bg-surface-container-low p-6"
      >
        <p className="font-headline text-title">
          El contenido encuentra su lugar
        </p>
      </div>
      <p
        role="status"
        className="font-label text-caption text-on-surface-variant"
      >
        {iteration === 0
          ? "Muestra preparada."
          : `Muestra reproducida ${iteration} ${iteration === 1 ? "vez" : "veces"}.`}
      </p>
    </div>
  );
}
