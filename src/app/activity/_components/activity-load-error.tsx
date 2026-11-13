"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Alert } from "@/lib/components/alert/alert";

export function ActivityLoadError() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Alert
      title="No se pudo cargar la actividad"
      variant="error"
      announcement="assertive"
      action={{
        label: pending ? "Cargando actividad…" : "Reintentar",
        onClick: () => startTransition(() => router.refresh()),
        pending,
      }}
    >
      Vuelve a intentarlo para consultar los registros del periodo.
    </Alert>
  );
}
