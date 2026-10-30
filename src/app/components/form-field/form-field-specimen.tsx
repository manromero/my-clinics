"use client";

import { useState } from "react";
import { FormField } from "@/lib/components/form-field/form-field";
import { Button } from "@/lib/components/button/button";

const controlClass =
  "min-h-11 w-full rounded-md border border-outline-variant/15 bg-surface-container-lowest px-3 py-2 text-base text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-error";

export function FormFieldSpecimen() {
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
        <FormField
          label="Nombre de ejemplo"
          required
          help="Este campo es obligatorio. Puedes escribir con el teclado."
        >
          {(props) => (
            <input
              {...props}
              className={controlClass}
              placeholder="Escribe un nombre"
            />
          )}
        </FormField>
        <FormField
          label="Descripción complementaria"
          help="Puedes dejarla vacía. El texto de ayuda se adapta a varias líneas en pantallas estrechas."
        >
          {(props) => <textarea {...props} className={controlClass} rows={2} />}
        </FormField>
      </div>
      <div className="space-y-4 rounded-xl bg-surface-container-low p-4 sm:p-6">
        <FormField
          id="specimen-validation"
          label="Valor de prueba"
          required
          help="La página decide cuándo mostrar o retirar el error."
          error={error}
        >
          {(props) => (
            <input
              {...props}
              className={controlClass}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          )}
        </FormField>
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
          API: label, id opcional, required (false por defecto), help, error y
          describedBy para descripciones externas. children recibe id, required,
          aria-invalid y aria-describedby; aplica estos atributos al control.
        </p>
        <p>
          FormField genera un identificador estable si no se indica id. El
          consumidor conserva el valor, los eventos y la validación. Un error
          marca el control como inválido y se añade a la ayuda accesible.
        </p>
      </div>
    </div>
  );
}
