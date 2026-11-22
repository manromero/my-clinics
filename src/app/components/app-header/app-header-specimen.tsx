"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/lib/components/app-header/app-header";
import type { MainDestination } from "@/lib/components/main-navigation/main-navigation";
import { PageContainer } from "@/lib/components/page-container/page-container";

const identity = {
  displayName: "Dra. Ana Hurtado",
  email: "ana@example.test",
  timezone: "Europe/Madrid",
};

export function AppHeaderSpecimen() {
  const [currentHref, setCurrentHref] = useState<MainDestination>("/activity");
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "pending" | "error" | "success"
  >("idle");

  useEffect(() => {
    if (status !== "pending") return;
    const timer = window.setTimeout(
      () => setStatus(attempts === 1 ? "error" : "success"),
      2000,
    );
    return () => window.clearTimeout(timer);
  }, [attempts, status]);

  return (
    <section aria-labelledby="sesion" className="bg-surface-container-low">
      <h2
        id="sesion"
        className="mx-auto max-w-7xl px-4 py-3 font-label text-label font-semibold sm:px-6 lg:px-12"
      >
        Cabecera con sesión iniciada
      </h2>
      <div
        onClickCapture={(event) => {
          const link = (event.target as HTMLElement).closest("nav a");
          if (
            link &&
            event.button === 0 &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.shiftKey
          ) {
            event.preventDefault();
            setCurrentHref(link.getAttribute("href") as MainDestination);
          }
        }}
      >
        <AppHeader
          variant="signed-in"
          brandHref="/components"
          currentHref={currentHref}
          account={{
            identity,
            accountLink: { href: "#api", label: "Ajustes de cuenta (ejemplo)" },
            onSignOut: () => {
              setAttempts((count) => count + 1);
              setStatus("pending");
            },
            signOutPending: status === "pending",
            signOutError:
              status === "error" ? "Vuelve a intentarlo." : undefined,
          }}
        />
      </div>
      <PageContainer className="py-5!">
        <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
          Elige un destino para cambiar la selección sin salir del catálogo.
          Abre la cuenta y solicita el cierre de sesión. La primera solicitud
          simula un fallo y el reintento simula el éxito.
        </p>
        <p role="status" className="mt-2 text-sm text-on-surface-variant">
          Solicitudes recibidas: {attempts}.
          {status === "success" && " Simulación de cierre completada."}
        </p>
      </PageContainer>
    </section>
  );
}
