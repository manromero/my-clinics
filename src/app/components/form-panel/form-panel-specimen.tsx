"use client";

import { useRef, useState, type FormEvent } from "react";
import { Alert } from "@/lib/components/alert/alert";
import { Button } from "@/lib/components/button/button";
import { FormPanel } from "@/lib/components/form-panel/form-panel";
import { TextInput } from "@/lib/components/text-input/text-input";

export function FormPanelSpecimen({ modal = false }: { modal?: boolean }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [invalid, setInvalid] = useState(false);
  const [fail, setFail] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) {
      setInvalid(true);
      input.current?.focus();
      return;
    }
    setInvalid(false);
    setError(undefined);
    setMessage("");
    setPending(true);
    setAttempts((n) => n + 1);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setPending(false);
    if (fail)
      setError(
        "La simulación ha fallado. Conservamos tus cambios para que puedas reintentarlo.",
      );
    else {
      setMessage(`Cambios guardados: ${value}`);
      if (modal) setOpen(false);
    }
  }
  function cancel() {
    setOpen(false);
    setError(undefined);
    setInvalid(false);
    setMessage("Edición cancelada. No se han guardado cambios.");
  }
  const fields = (
    <TextInput
      ref={input}
      label="Nombre del ejemplo"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
      error={invalid ? "Escribe un nombre." : undefined}
      help="Los valores se conservan si falla el guardado."
    />
  );
  const shared = {
    title: modal ? "Editar ejemplo" : "Nuevo ejemplo",
    description: "Revisa los datos y guarda los cambios.",
    onSubmit: save,
    onCancel: cancel,
    pending,
    error,
    noValidate: true,
    children: fields,
  };
  return (
    <div className="space-y-5">
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={fail}
          disabled={pending}
          onChange={(e) => setFail(e.target.checked)}
          className="size-5 accent-primary"
        />
        Simular fallo al guardar
      </label>
      {modal ? (
        <>
          <Button onClick={() => setOpen(true)}>Abrir formulario modal</Button>
          <FormPanel
            {...shared}
            presentation="modal"
            open={open}
            initialFocusRef={input}
          />
        </>
      ) : (
        <FormPanel {...shared} />
      )}
      <p className="text-sm text-on-surface-variant">
        Intentos de guardado: {attempts}
      </p>
      {message && (
        <Alert
          title={
            message.startsWith("Cambios")
              ? "Guardado completado"
              : "Edición cancelada"
          }
          announcement="polite"
          variant={message.startsWith("Cambios") ? "success" : "info"}
        >
          {message}
        </Alert>
      )}
    </div>
  );
}
