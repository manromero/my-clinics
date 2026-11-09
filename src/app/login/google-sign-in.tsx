"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert } from "@/lib/components/alert/alert";
import { Button } from "@/lib/components/button/button";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {
  beginGoogleSignIn,
  completeGoogleSignIn,
} from "@/lib/supabase/google-oauth";
import { useClinicSession } from "@/lib/supabase/use-clinic-session";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

export function GoogleSignIn() {
  const router = useRouter();
  const session = useClinicSession();
  const exchange = useRef<Promise<boolean>>(null);
  const busy = useRef(false);
  const [callback, setCallback] = useState<"checking" | "complete" | "failed">(
    "checking",
  );
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    let current = true;
    // Share the one-use code exchange when React repeats the effect.
    exchange.current ??= completeGoogleSignIn(client).catch(() => false);
    void exchange.current.then((ok) => {
      if (current) setCallback(ok ? "complete" : "failed");
    });
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (callback === "complete" && session.status === "authorized")
      router.replace("/clinics");
  }, [callback, router, session.status]);

  useEffect(() => {
    function restore(event: PageTransitionEvent) {
      if (event.persisted) {
        busy.current = false;
        setPending(false);
      }
    }
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  async function signIn() {
    const client = getSupabaseBrowserClient();
    if (!client || busy.current) return;
    busy.current = true;
    setPending(true);
    setFailed(false);
    try {
      if (await beginGoogleSignIn(client, session.status !== "signed-out"))
        return;
    } catch {
      // Keep provider errors and callback details out of the UI.
    }
    busy.current = false;
    setFailed(true);
    setPending(false);
  }

  const unavailable = session.status === "unconfigured";
  const checking =
    !unavailable &&
    (callback === "checking" ||
      session.status === "checking" ||
      (callback === "complete" && session.status === "authorized"));
  const denied = session.status === "denied";
  const failure =
    failed || callback === "failed" || session.status === "failed";

  return (
    <PageContainer
      as="main"
      className="grid flex-1 place-items-center py-12 sm:py-20"
    >
      <section
        aria-labelledby="login-title"
        className="w-full max-w-lg overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_12px_36px_rgb(26_27_32/0.07)]"
      >
        <div
          aria-hidden="true"
          className="h-2 bg-linear-to-r from-primary via-primary-container to-tertiary"
        />
        <div className="space-y-6 p-6 text-center sm:p-10">
          <p className="inline-block rounded-full bg-surface-container-low px-4 py-1 font-label text-caption font-semibold tracking-wide text-tertiary uppercase">
            Portal clínico privado
          </p>
          <div className="space-y-2">
            <h1
              id="login-title"
              className="font-headline text-headline font-semibold"
            >
              MyClinics
            </h1>
            <p className="text-on-surface-variant">
              Gestión privada de clínicas y actividad odontológica.
            </p>
          </div>
          {unavailable ? (
            <Alert title="Acceso no disponible" className="text-left">
              El inicio de sesión aún no está disponible en este entorno.
            </Alert>
          ) : (
            <div className="space-y-4">
              {denied ? (
                <Alert
                  title="Cuenta no autorizada"
                  variant="error"
                  announcement="assertive"
                  className="text-left"
                >
                  Usa la cuenta de Google autorizada para acceder a tus
                  clínicas.
                </Alert>
              ) : failure ? (
                <Alert
                  title="No se pudo iniciar sesión"
                  variant="error"
                  announcement="assertive"
                  className="text-left"
                >
                  Vuelve a intentarlo con tu cuenta de Google.
                </Alert>
              ) : null}
              <Button
                variant="secondary"
                size="lg"
                startIcon={<GoogleIcon />}
                className="w-full"
                pending={pending || checking}
                onClick={() => void signIn()}
              >
                {checking
                  ? "Comprobando el acceso…"
                  : pending
                    ? "Abriendo Google…"
                    : denied
                      ? "Usar otra cuenta de Google"
                      : "Continuar con Google"}
              </Button>
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}
