"use client";

import { useRef, useState } from "react";
import { Select, type SelectProps } from "@/lib/components/select/select";
import { Button } from "@/lib/components/button/button";

const options: SelectProps["options"] = [
  {
    label: "Opciones habituales",
    options: [
      { value: "a", label: "Opción A" },
      {
        value: "b",
        label:
          "Opción B con un nombre más largo para comprobar el ancho disponible",
      },
      { value: "c", label: "Opción C (no disponible)", disabled: true },
    ],
  },
  { label: "Otras opciones", options: [{ value: "d", label: "Opción D" }] },
];

export function SelectSpecimen() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const ref = useRef<HTMLSelectElement>(null);
  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-xl bg-surface-container-low p-4 sm:p-6">
        <Select
          ref={ref}
          label="Opción de ejemplo"
          required
          options={options}
          placeholder="Elige una opción"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(undefined);
          }}
          help="Usa Tab para enfocar y las flechas o las letras para elegir. La opción C está deshabilitada."
          error={error}
        />
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              setError(value ? undefined : "Elige una opción para continuar.")
            }
          >
            Comprobar selección
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
          Valor seleccionado: {value || "vacío"}
        </p>
      </div>
      <div className="grid min-w-0 gap-6 sm:grid-cols-2">
        <Select
          label="Opción"
          options={options}
          defaultValue="a"
          help="Selección inicial sin marcador de posición."
        />
        <Select
          label="Selección con error"
          options={options}
          placeholder="Elige una opción"
          error="Revisa la selección."
        />
        <Select
          label="Selección deshabilitada"
          options={options}
          defaultValue="a"
          disabled
          help="No recibe foco ni permite cambios."
        />
        <Select
          label="Sin opciones disponibles"
          options={[]}
          placeholder="No hay opciones"
          help="La lista vacía no añade opciones automáticamente."
        />
      </div>
      <Select
        label="Una etiqueta larga que se adapta al espacio disponible en pantallas estrechas"
        options={options}
        defaultValue="b"
        invalid
        aria-describedby="external-select-help"
      />
      <p id="external-select-help" className="text-sm text-on-surface-variant">
        Estado inválido con descripción externa.
      </p>
      <div className="space-y-3 text-sm leading-6 text-on-surface-variant">
        <p>
          Select requiere label y options. Cada opción tiene value, label y
          disabled opcional; los grupos tienen label, options y disabled
          opcional. Usa valores únicos y reserva la cadena vacía para
          placeholder.
        </p>
        <p>
          placeholder añade una opción vacía que permite borrar la selección.
          required exige un valor distinto de vacío. Sin placeholder ni valor
          inicial, el navegador elige la primera opción disponible; una lista
          vacía permanece vacía.
        </p>
        <p>
          value y onChange permiten controlar la selección; defaultValue fija el
          valor inicial sin controlarla. onChange entrega el evento nativo y
          event.target.value es una cadena.
        </p>
        <p>
          help y error se asocian al campo; error activa el estado inválido.
          invalid permite indicarlo sin mensaje local. Admite atributos nativos
          como id, name, required, disabled, eventos y ref; genera un id estable
          y conserva aria-describedby externo. className se aplica al select. La
          página decide cuándo validar; el menú y sus teclas dependen del
          navegador y del dispositivo.
        </p>
      </div>
    </div>
  );
}
