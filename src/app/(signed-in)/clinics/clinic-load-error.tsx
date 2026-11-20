"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Alert } from "@/lib/components/alert/alert";

export function ClinicLoadError() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Alert
      title="No se pudieron cargar las clínicas"
      variant="error"
      announcement="assertive"
      action={{
        label: pending ? "Cargando clínicas…" : "Reintentar",
        onClick: () => startTransition(() => router.refresh()),
        pending,
      }}
    >
      Vuelve a intentarlo para consultar tus clínicas.
    </Alert>
  );
}
