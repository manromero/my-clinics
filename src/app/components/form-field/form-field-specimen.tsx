"use client";

import { useState } from "react";
import { FieldLabel } from "@/lib/components/field-label/field-label";
import { FieldRequirement } from "@/lib/components/field-requirement/field-requirement";
import { FieldHelp } from "@/lib/components/field-help/field-help";
import { FieldError } from "@/lib/components/field-error/field-error";
import { Button } from "@/lib/components/button/button";

const controlClass =
  "min-h-11 w-full rounded-md border border-outline-variant/15 bg-surface-container-lowest px-3 py-2 text-base text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-error";
const labelRowClass =
  "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1";

export function FieldPrimitivesSpecimen() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>(
    "Escribe un valor para continuar.",
  );
  return (
    <div className="space-y-8">
      <p className="text-sm leading-6 text-on-surface-variant">
        Pulsa una etiqueta para enfocar su control y usa Tab para recorrer los
        ejemplos. Los controles de esta página son HTML nativo.
      </p>
      <div className="space-y-6 rounded-xl bg-surface-container-low p-4 sm:p-6">
        <div className="min-w-0 space-y-2">
          <div className={labelRowClass}>
            <FieldLabel htmlFor="specimen-name">Nombre de ejemplo</FieldLabel>
            <FieldRequirement required />
          </div>
          <input
            id="specimen-name"
            required
            aria-describedby="specimen-name-help"
            className={controlClass}
            placeholder="Escribe un nombre"
          />
          <FieldHelp id="specimen-name-help">
            Este campo es obligatorio. Puedes escribir con el teclado.
          </FieldHelp>
        </div>
        <div className="min-w-0 space-y-2">
          <div className={labelRowClass}>
            <FieldLabel htmlFor="specimen-description">
              Descripción complementaria
            </FieldLabel>
            <FieldRequirement />
          </div>
          <textarea
            id="specimen-description"
            aria-describedby="specimen-description-help"
            className={controlClass}
            rows={2}
          />
          <FieldHelp id="specimen-description-help">
            Puedes dejarla vacía. El texto de ayuda se adapta a varias líneas en
            pantallas estrechas.
          </FieldHelp>
        </div>
      </div>
      <div className="space-y-4 rounded-xl bg-surface-container-low p-4 sm:p-6">
        <div className="min-w-0 space-y-2">
          <div className={labelRowClass}>
            <FieldLabel htmlFor="specimen-validation">
              Valor de prueba
            </FieldLabel>
            <FieldRequirement required />
          </div>
          <input
            id="specimen-validation"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? "specimen-validation-help specimen-validation-error"
                : "specimen-validation-help"
            }
            className={controlClass}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <FieldHelp id="specimen-validation-help">
            La página decide cuándo mostrar o retirar el error.
          </FieldHelp>
          {error && (
            <FieldError id="specimen-validation-error">{error}</FieldError>
          )}
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            setError(
              value.trim() ? undefined : "Escribe un valor para continuar.",
            )
          }
        >
          Comprobar valor
        </Button>
        <p role="status" className="text-sm text-on-surface-variant">
          {error ? "Ejemplo con error." : "Valor comprobado sin error."}
        </p>
      </div>
      <div className="space-y-3 text-sm leading-6 text-on-surface-variant">
        <p>
          FieldLabel acepta los atributos de label, incluido htmlFor.
          FieldRequirement acepta los de span y required (false por defecto);
          muestra Obligatorio u Opcional.
        </p>
        <p>
          FieldHelp y FieldError aceptan los atributos de p, incluido id, y
          contenido como children. Cada pieza admite className y ref. No generan
          identificadores ni modifican el control.
        </p>
        <p>
          La composición asigna los identificadores, required, aria-describedby
          y aria-invalid al control. También conserva el valor, los eventos y la
          validación. Al retirar el error, elimina su identificador de
          aria-describedby.
        </p>
      </div>
    </div>
  );
}
