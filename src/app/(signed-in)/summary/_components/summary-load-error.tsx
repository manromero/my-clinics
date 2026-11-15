"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Alert } from "@/lib/components/alert/alert";

export function SummaryLoadError() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Alert
      title="No se pudo cargar el resumen"
      variant="error"
      announcement="assertive"
      action={{
        label: pending ? "Cargando resumen…" : "Reintentar",
        onClick: () => startTransition(() => router.refresh()),
        pending,
      }}
    >
      Vuelve a intentarlo para consultar los totales del periodo.
    </Alert>
  );
}
