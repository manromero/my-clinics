"use client";

import { useRef, useState } from "react";
import { Button } from "@/lib/components/button/button";
import { Dialog } from "@/lib/components/dialog/dialog";

export function DialogSpecimen() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<"sm" | "md">("md");
  const [long, setLong] = useState(false);
  const [dismissible, setDismissible] = useState(true);
  const [customFocus, setCustomFocus] = useState(false);
  const actionRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="space-y-6">
      <fieldset className="flex flex-wrap gap-4 rounded-xl bg-surface-container-low p-5">
        <legend className="font-label font-semibold">Configurar ejemplo</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={size === "sm"}
            onChange={(e) => setSize(e.target.checked ? "sm" : "md")}
          />
          Tamaño pequeño
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={long}
            onChange={(e) => setLong(e.target.checked)}
          />
          Contenido largo
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!dismissible}
            onChange={(e) => setDismissible(!e.target.checked)}
          />
          Solo cierre explícito
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={customFocus}
            onChange={(e) => setCustomFocus(e.target.checked)}
          />
          Foco inicial en acción
        </label>
      </fieldset>
      <Button onClick={() => setOpen(true)}>Abrir diálogo</Button>
      <p className="text-sm leading-6 text-on-surface-variant">
        Prueba Tab, Mayús + Tab y Escape. Al cerrar, el foco vuelve a Abrir
        diálogo. El fondo no admite interacción mientras el diálogo está
        abierto.
      </p>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Un momento para revisar"
        description="Lee esta información antes de continuar."
        size={size}
        dismissible={dismissible}
        initialFocusRef={customFocus ? actionRef : undefined}
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button ref={actionRef} onClick={() => setOpen(false)}>
              Entendido
            </Button>
          </>
        }
      >
        <p>
          Este espacio reúne contenido y acciones en una superficie tranquila.
          Puedes cerrar el ejemplo sin modificar ningún dato.
        </p>
        {long &&
          Array.from({ length: 12 }, (_, i) => (
            <p className="mt-5" key={i}>
              Sección {i + 1}. El contenido se desplaza dentro del diálogo. La
              cabecera y las acciones permanecen visibles, también en una
              pantalla estrecha. Revisa cada apartado a tu ritmo.
            </p>
          ))}
      </Dialog>
      <div className="space-y-3 text-sm leading-6 text-on-surface-variant">
        <p>
          API: open y onOpenChange controlan la apertura. title es obligatorio;
          description, children y actions componen el contenido. size admite sm
          y md (predeterminado). initialFocusRef elige un elemento enfocable del
          contenido; por defecto se enfoca el título para empezar a leer.
        </p>
        <p>
          dismissible es true por defecto: Escape, el botón Cerrar diálogo y una
          pulsación que empieza y termina en el fondo solicitan el cierre. Con
          false, solo las acciones explícitas o un cambio de open cierran el
          diálogo. El consumidor debe ofrecer una salida accesible y actualizar
          open en onOpenChange.
        </p>
        <p>
          Se utiliza dialog nativo con showModal, sin dependencia adicional: el
          navegador gestiona la capa modal, la contención del foco y la
          inactividad del fondo. El componente bloquea el desplazamiento de la
          página y devuelve el foco al control de apertura si sigue disponible.
          Destinado a un diálogo a la vez.
        </p>
      </div>
    </div>
  );
}
