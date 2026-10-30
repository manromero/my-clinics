"use client";

import { useRef, useState } from "react";
import { TextInput } from "@/lib/components/text-input/text-input";
import { Button } from "@/lib/components/button/button";

export function TextInputSpecimen() {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const error =
    checked && !value.trim() ? "Escribe un texto para continuar." : undefined;

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-xl bg-surface-container-low p-4 sm:p-6">
        <TextInput
          ref={ref}
          label="Texto de ejemplo"
          required
          placeholder="Escribe aquí"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setChecked(false);
          }}
          onBlur={() => setBlurred(true)}
          help="Comprueba el campo vacío y escribe para retirar el error."
          error={error}
        />
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setChecked(true)}>Comprobar texto</Button>
          <Button variant="secondary" onClick={() => ref.current?.focus()}>
            Enfocar campo
          </Button>
        </div>
        <p role="status" className="text-sm text-on-surface-variant">
          {error
            ? "Hay un error en el campo."
            : checked
              ? "Texto comprobado sin error."
              : "Puedes editar el texto."}
          {blurred ? " El campo ha perdido el foco." : ""}
        </p>
      </div>
      <div className="grid min-w-0 gap-6 sm:grid-cols-2">
        <TextInput
          label="Buscar texto"
          placeholder="Filtrar por nombre…"
          leadingAdornment={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="10" cy="10" r="6" />
              <path d="m15 15 5 5" />
            </svg>
          }
          help="El icono es decorativo; la etiqueta identifica el campo."
        />
        <TextInput
          label="Referencia"
          defaultValue="REF-2026"
          trailingAdornment={<span>ABC</span>}
        />
        <TextInput
          label="Texto deshabilitado"
          defaultValue="Edición no disponible"
          disabled
          help="No recibe foco ni permite cambios."
        />
        <TextInput
          label="Texto de solo lectura"
          defaultValue="Puedes seleccionar y copiar este texto"
          readOnly
          help="Recibe foco y conserva su valor."
        />
      </div>
      <TextInput
        label="Una etiqueta larga que se adapta al espacio disponible sin ocultar la indicación del campo"
        defaultValue="Un valor muy largo que se puede recorrer con las flechas, seleccionar y editar sin ensanchar la página ni perder su contenido."
        help="Usa Inicio y Fin para recorrer el valor completo, también en una pantalla estrecha."
      />
      <TextInput
        label="Estado inválido sin mensaje local"
        invalid
        aria-describedby="external-text-help"
      />
      <p id="external-text-help" className="text-sm text-on-surface-variant">
        Este campo ilustra invalid con una descripción externa.
      </p>
      <div className="space-y-3 text-sm leading-6 text-on-surface-variant">
        <p>
          TextInput requiere label. help y error añaden descripciones asociadas;
          error activa el estado inválido. invalid permite indicar ese estado
          sin mensaje local.
        </p>
        <p>
          Admite atributos nativos de input de texto: id, name, value o
          defaultValue, placeholder, required, disabled, readOnly, autoComplete,
          eventos y ref. Si omites id, genera uno estable. aria-describedby
          conserva las descripciones externas. className se aplica al input.
        </p>
        <p>
          leadingAdornment y trailingAdornment son contenido decorativo, oculto
          a las tecnologías de asistencia y sin interacción. Usa adornos breves;
          la etiqueta siempre permanece visible. La página que usa el campo
          decide cuándo validar.
        </p>
      </div>
    </div>
  );
}
