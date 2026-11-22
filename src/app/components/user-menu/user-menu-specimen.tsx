"use client";

import { useState } from "react";
import { Button } from "@/lib/components/button/button";
import { UserMenu } from "@/lib/components/user-menu/user-menu";

const identity = {
  displayName: "Dra. Ana Hurtado",
  email: "ana@example.test",
  timezone: "Europe/Madrid",
};

export function UserMenuSpecimen({ compact = false }: { compact?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState("");
  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-on-surface-variant">
        Abre la cuenta y pulsa Cerrar sesión. La simulación queda pendiente
        hasta elegir un resultado; no modifica ninguna sesión.
      </p>
      <div className="min-h-[440px] rounded-xl bg-surface-container-low p-4 sm:p-6">
        <UserMenu
          identity={identity}
          variant={compact ? "compact" : "full"}
          accountLink={
            compact
              ? undefined
              : { href: "#api", label: "Ajustes de cuenta (ejemplo)" }
          }
          signOutPending={pending}
          signOutError={error}
          onSignOut={() => {
            setPending(true);
            setError(undefined);
            setResult("");
            setAttempts((count) => count + 1);
          }}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={!pending}
          onClick={() => {
            setPending(false);
            setError(
              "No se ha podido completar la operación. Vuelve a intentarlo.",
            );
          }}
        >
          Simular fallo
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!pending}
          onClick={() => {
            setPending(false);
            setError(undefined);
            setResult("Simulación completada; no hay una sesión real.");
          }}
        >
          Simular éxito
        </Button>
      </div>
      <p className="text-sm text-on-surface-variant">
        Solicitudes recibidas: {attempts}
      </p>
      <p role="status" className="text-sm text-on-surface-variant">
        {result}
      </p>
    </div>
  );
}
