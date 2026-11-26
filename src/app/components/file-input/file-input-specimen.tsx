"use client";

import { useState } from "react";
import {
  FileInput,
  type FileInputValue,
} from "@/lib/components/file-input/file-input";

export function FileInputSpecimen() {
  const [value, setValue] = useState<FileInputValue>(null);
  const [saved, setSaved] = useState<FileInputValue>({
    kind: "persisted",
    name: "documento-guardado.pdf",
  });
  const [required, setRequired] = useState<FileInputValue>(null);
  return (
    <div className="space-y-8">
      <FileInput
        id="demo-file"
        label="Documento"
        value={value}
        onChange={setValue}
        accept=".pdf,application/pdf"
        maxBytes={1048576}
        help="Un PDF de hasta 1 MiB (1.048.576 bytes)."
      />
      <p className="text-sm leading-6 text-on-surface-variant">
        Si se rechaza un archivo o se cancela el selector, se conserva la
        selección anterior. Una selección válida elimina el error de selección.
        Prueba varios archivos, otro tipo o un archivo demasiado grande.
      </p>
      <FileInput
        label="Archivo guardado"
        value={saved}
        onChange={setSaved}
        help="El nombre guardado es un descriptor: no contiene bytes locales. Puedes reemplazarlo o quitarlo."
      />
      <FileInput
        label="Adjunto obligatorio"
        required
        value={required}
        onChange={setRequired}
        error={required ? undefined : "Selecciona un archivo para continuar."}
        help="Cualquier tipo. La obligatoriedad y los errores del formulario los controla el consumidor."
      />
      <FileInput
        label="No disponible"
        disabled
        value={null}
        onChange={() => {}}
      />
      <FileInput
        label="Procesando"
        pending
        value={{ kind: "persisted", name: "documento-en-proceso.pdf" }}
        onChange={() => {}}
      />
      <p className="text-sm leading-6 text-on-surface-variant">
        El consumidor conserva el valor controlado: archivo local, descriptor
        guardado o vacío. Quitar y reemplazar solo cambian ese valor; este
        ejemplo no guarda ni sube archivos. La comprobación del tipo usa
        extensión o MIME, no inspecciona el contenido.
      </p>
    </div>
  );
}
