"use client";

import { useState } from "react";
import { Button } from "@/lib/components/button/button";
import { LoadingState } from "@/lib/components/loading-state/loading-state";

export function LoadingStateSpecimen() {
  const [busy, setBusy] = useState(true);
  const [indicator, setIndicator] = useState<"spinner" | "skeleton" | "none">(
    "skeleton",
  );
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h4 className="font-label text-label font-semibold">Compacto</h4>
        <LoadingState label="Cargando contenido…" />
        <LoadingState label="Preparando la vista…" indicator="none" />
      </div>
      <div className="space-y-4">
        <h4 className="font-headline text-title">Región de contenido</h4>
        <p className="text-sm leading-6 text-on-surface-variant">
          Simulación local: inicia o finaliza la carga y elige su decoración. No
          se guardan datos.
        </p>
        <label className="flex flex-col gap-2 font-label text-label">
          Decoración de carga
          <select
            className="min-h-11 w-full rounded-md bg-surface-container-low px-3 sm:w-auto sm:self-start"
            value={indicator}
            onChange={(event) =>
              setIndicator(event.target.value as typeof indicator)
            }
          >
            <option value="spinner">Indicador</option>
            <option value="skeleton">Esqueleto</option>
            <option value="none">Solo texto</option>
          </select>
        </label>
        <Button variant="secondary" onClick={() => setBusy(!busy)}>
          {busy ? "Finalizar carga" : "Iniciar carga"}
        </Button>
        <LoadingState
          id="content-loading"
          variant="region"
          label={
            busy ? "Cargando el contenido del ejemplo…" : "Contenido disponible"
          }
          indicator={busy ? indicator : "none"}
        />
        <section
          aria-label="Contenido de ejemplo"
          aria-busy={busy}
          aria-describedby="content-loading"
          className="min-h-16 rounded-lg bg-surface-container-low p-4"
        >
          {!busy && (
            <p className="text-sm leading-6">
              La carga ha terminado. El contenido del ejemplo ya está
              disponible.
            </p>
          )}
        </section>
      </div>
      <div className="space-y-3 text-sm leading-6 text-on-surface-variant">
        <h4 className="font-label font-semibold text-on-surface">
          Movimiento reducido
        </h4>
        <p>
          El indicador gira y el esqueleto pulsa solo si el sistema permite
          animaciones. Con movimiento reducido, ambos permanecen estáticos y el
          texto sigue visible.
        </p>
        <p>
          API: label es el texto visible anunciado mediante status; variant
          admite compact (por defecto) y region. indicator admite spinner (por
          defecto), skeleton y none. Acepta atributos de div, id, className y
          ref. Asocia el id con aria-describedby en el contenido y actualiza
          allí aria-busy. Mantén el estado fuera de la región ocupada para no
          aplazar sus anuncios. Conserva el estado montado y actualiza label al
          finalizar.
        </p>
      </div>
    </div>
  );
}
