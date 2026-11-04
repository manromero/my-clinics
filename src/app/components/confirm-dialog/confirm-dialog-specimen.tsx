"use client";

import { useState } from "react";
import { Button } from "@/lib/components/button/button";
import { ConfirmDialog } from "@/lib/components/confirm-dialog/confirm-dialog";

export function ConfirmDialogSpecimen({
  destructive = false,
}: {
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [fail, setFail] = useState(false);
  const [error, setError] = useState<string>();
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("");
  async function confirm() {
    setError(undefined);
    setAttempts((value) => value + 1);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    if (fail) {
      setError(
        "El ejemplo sigue disponible. Desmarca la simulación de fallo y vuelve a intentarlo.",
      );
      throw new Error("Synthetic confirmation failure");
    }
    setOpen(false);
    setMessage(
      destructive
        ? "Registro de ejemplo eliminado."
        : "Acción de ejemplo confirmada.",
    );
  }
  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-on-surface-variant">
        {destructive
          ? "Ejemplo sintético: 28/10/2026 · Clínica de ejemplo · 240,00 €. Cancelar conserva el registro; confirmar simula su eliminación."
          : "Confirma una acción genérica sin modificar datos reales."}
      </p>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={fail}
          onChange={(event) => setFail(event.target.checked)}
          className="size-5 accent-primary"
        />
        Simular fallo
      </label>
      <Button
        variant={destructive ? "destructive" : "primary"}
        onClick={() => {
          setError(undefined);
          setMessage("");
          setOpen(true);
        }}
      >
        {destructive ? "Eliminar registro de ejemplo" : "Abrir confirmación"}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setMessage("Acción cancelada. El ejemplo se conserva.");
        }}
        title={
          destructive ? "¿Eliminar este registro?" : "¿Confirmar la acción?"
        }
        description={
          destructive
            ? "Esta acción no se puede deshacer. Revisa el registro antes de eliminarlo."
            : "Revisa la información antes de continuar."
        }
        destructive={destructive}
        confirmLabel={destructive ? "Eliminar" : "Confirmar"}
        pendingLabel={destructive ? "Eliminando…" : "Confirmando…"}
        error={error}
        onConfirm={confirm}
      >
        {error && (
          <label className="mb-5 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={fail}
              onChange={(event) => setFail(event.target.checked)}
              className="size-5 accent-primary"
            />
            Mantener fallo simulado
          </label>
        )}
        {destructive && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 rounded-lg bg-surface-container-low p-4 text-sm">
            <dt className="text-on-surface-variant">Fecha</dt>
            <dd>28/10/2026</dd>
            <dt className="text-on-surface-variant">Clínica</dt>
            <dd>Clínica de ejemplo</dd>
            <dt className="text-on-surface-variant">Importe</dt>
            <dd className="font-semibold">240,00 €</dd>
          </dl>
        )}
      </ConfirmDialog>
      <p className="text-sm text-on-surface-variant">
        Intentos de confirmación: {attempts}
      </p>
      <p role="status" className="text-sm text-on-surface-variant">
        {message}
      </p>
    </div>
  );
}
