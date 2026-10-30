"use client";

import { useState } from "react";
import { SegmentedControl } from "@/lib/components/segmented-control/segmented-control";

const states = [
  { value: "active", label: "Activa" },
  { value: "inactive", label: "Inactiva" },
];
const modes = [
  { value: "percentage", label: "Porcentaje (%)" },
  { value: "direct", label: "Importe directo" },
];

export function SegmentedControlSpecimen() {
  const [state, setState] = useState("active");
  const [mode, setMode] = useState("percentage");
  return (
    <div className="space-y-8">
      <p className="text-sm leading-6 text-on-surface-variant">
        Usa Tab para entrar y salir del grupo, las flechas para cambiar de
        opción y Espacio para seleccionar. Solo puede haber una opción
        seleccionada por grupo. Los ejemplos no guardan datos.
      </p>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <SegmentedControl
            label="Estado del centro"
            options={states}
            value={state}
            onValueChange={setState}
          />
          <p role="status" className="text-sm text-on-surface-variant">
            Selección: {state === "active" ? "Activa" : "Inactiva"}.
          </p>
        </div>
        <div className="min-w-0 space-y-3">
          <SegmentedControl
            label="Modo de cálculo"
            options={modes}
            value={mode}
            onValueChange={setMode}
          />
          <p role="status" className="text-sm text-on-surface-variant">
            Selección:{" "}
            {mode === "percentage" ? "Porcentaje (%)" : "Importe directo"}.
          </p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <SegmentedControl
            label="Opción desactivada"
            options={[
              { value: "available", label: "Disponible" },
              { value: "unavailable", label: "No disponible", disabled: true },
            ]}
            defaultValue="available"
          />
          <p className="text-sm leading-6 text-on-surface-variant">
            «No disponible» está desactivada y las flechas la omiten.
          </p>
        </div>
        <SegmentedControl
          label="Grupo desactivado"
          options={states}
          defaultValue="inactive"
          disabled
        />
      </div>
      <details className="rounded-lg bg-surface-container-low p-4 text-sm leading-6">
        <summary className="cursor-pointer font-label font-semibold">
          API y uso
        </summary>
        <p className="mt-3">
          label nombra el grupo; options contiene value, label y disabled
          opcional. Usa value y onValueChange para controlar la selección, o
          defaultValue para una selección inicial. name permite enviar el valor
          en un formulario; si se omite, cada grupo recibe un nombre
          independiente. disabled desactiva todo el grupo. Los valores de las
          opciones deben ser únicos dentro del grupo.
        </p>
      </details>
    </div>
  );
}
