"use client";

import { useRef, useState } from "react";
import { DateInput } from "@/lib/components/date-input/date-input";
import { Button } from "@/lib/components/button/button";

export function DateInputSpecimen() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-xl bg-surface-container-low p-4 sm:p-6">
        <DateInput
          ref={ref}
          label="Fecha de ejemplo"
          required
          min="2026-10-01"
          max="2026-10-31"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(undefined);
          }}
          help="Elige un día del 1 al 31 de octubre de 2026. Puedes usar el teclado o el calendario."
          error={error}
        />
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              setError(
                !value
                  ? "Elige una fecha para continuar."
                  : !ref.current?.validity.valid
                    ? "Elige una fecha dentro del intervalo indicado."
                    : undefined,
              )
            }
          >
            Comprobar fecha
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setValue("");
              setError(undefined);
            }}
          >
            Vaciar
          </Button>
          <Button variant="secondary" onClick={() => ref.current?.focus()}>
            Enfocar campo
          </Button>
        </div>
        <p role="status" className="text-sm text-on-surface-variant">
          Valor de calendario: {value || "vacío"}
        </p>
      </div>
      <div className="grid min-w-0 gap-6 sm:grid-cols-2">
        <DateInput
          label="Fecha opcional"
          help="Sin límites ni fecha propuesta."
        />
        <DateInput
          label="Fecha con error"
          defaultValue="2026-09-30"
          error="Revisa la fecha seleccionada."
        />
        <DateInput
          label="Fecha deshabilitada"
          defaultValue="2026-10-15"
          disabled
          help="No recibe foco ni permite cambios."
        />
        <DateInput
          label="Fecha de solo lectura"
          defaultValue="2026-10-25"
          readOnly
          help="Recibe foco y conserva su valor."
        />
      </div>
      <DateInput
        label="Una etiqueta de fecha larga que se adapta al ancho disponible"
        invalid
        aria-describedby="external-date-help"
      />
      <p id="external-date-help" className="text-sm text-on-surface-variant">
        Estado inválido con descripción externa.
      </p>
      <div className="space-y-3 text-sm leading-6 text-on-surface-variant">
        <p>
          DateInput requiere label. help y error se asocian al campo; error
          activa el estado inválido. invalid permite indicarlo sin mensaje
          local. La página decide cuándo validar.
        </p>
        <p>
          value, defaultValue, min y max son cadenas de calendario AAAA-MM-DD;
          el valor vacío es una cadena vacía. onChange entrega el evento nativo:
          lee event.target.value sin convertirlo a Date. El formato visible y el
          calendario dependen del idioma, navegador y dispositivo.
        </p>
        <p>
          Admite required, disabled, readOnly, id, name, eventos, ref y otros
          atributos nativos. Genera un id estable si se omite; aria-describedby
          conserva referencias externas y className se aplica al input. No
          propone fechas automáticamente.
        </p>
      </div>
    </div>
  );
}
