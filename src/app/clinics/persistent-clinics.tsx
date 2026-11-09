"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createBrowserClinicSource } from "@/lib/clinics/browser-clinic-source";
import { Alert } from "@/lib/components/alert/alert";
import { Button } from "@/lib/components/button/button";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useClinicSession } from "@/lib/supabase/use-clinic-session";
import { ClinicsPreview } from "./clinics-preview";

export function PersistentClinics() {
  const router = useRouter();
  const session = useClinicSession();
  const [logout, setLogout] = useState<"pending" | "failed">();
  const busy = useRef(false);

  async function signOut() {
    const client = getSupabaseBrowserClient();
    if (!client || busy.current) return;
    busy.current = true;
    setLogout("pending");
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      router.replace("/login");
    } catch {
      setLogout("failed");
    } finally {
      busy.current = false;
    }
  }

  if (session.status === "authorized" && !logout) {
    const client = getSupabaseBrowserClient();
    if (client)
      return (
        <ClinicsPreview
          key={session.userId}
          initialClinics={[]}
          persistentSource={createBrowserClinicSource(client)}
          persistentActions={
            <Button variant="secondary" onClick={() => void signOut()}>
              Cerrar sesión
            </Button>
          }
        />
      );
  }

  const checking = session.status === "checking" || logout === "pending";
  const denied = session.status === "denied";
  const unconfigured = session.status === "unconfigured";
  const failed = session.status === "failed";

  return (
    <PageContainer as="main" className="flex-1 space-y-8">
      <PageHeader
        title="Gestión de clínicas"
        eyebrow="Configuración de centros"
      />
      {checking ? (
        <LoadingState
          label={
            logout === "pending" ? "Cerrando sesión…" : "Comprobando el acceso…"
          }
          variant="region"
        />
      ) : logout === "failed" ? (
        <Alert
          title="No se pudo cerrar la sesión"
          variant="error"
          announcement="assertive"
          action={{ label: "Reintentar", onClick: () => void signOut() }}
        >
          Vuelve a intentarlo para cerrar la sesión en este dispositivo.
        </Alert>
      ) : (
        <Alert
          title={
            denied
              ? "Cuenta no autorizada"
              : unconfigured
                ? "Acceso no disponible"
                : failed
                  ? "No se pudo comprobar el acceso"
                  : "Inicia sesión para ver tus clínicas"
          }
          variant={denied || failed ? "error" : "info"}
          announcement="polite"
        >
          <p>
            {denied
              ? "Esta cuenta no tiene acceso a las clínicas guardadas."
              : unconfigured
                ? "El inicio de sesión aún no está disponible en este entorno."
                : failed
                  ? "Vuelve a intentarlo desde la pantalla de acceso."
                  : "Accede con la cuenta de Google autorizada."}
          </p>
          <Link
            href="/login"
            className="mt-2 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
          >
            {denied ? "Usar otra cuenta" : "Ir al inicio de sesión"}
          </Link>
        </Alert>
      )}
    </PageContainer>
  );
}
