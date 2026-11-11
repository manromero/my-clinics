"use client";

import { useActionState, useEffect, useRef } from "react";
import { Alert } from "@/lib/components/alert/alert";
import { Button } from "@/lib/components/button/button";
import { startGoogleSignIn, type SignInIssue } from "./actions";

export function GoogleSignInForm({
  initialIssue,
}: {
  initialIssue: SignInIssue;
}) {
  const [issue, start, pending] = useActionState(
    startGoogleSignIn,
    initialIssue,
  );
  const feedback = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (issue && !pending) feedback.current?.focus();
  }, [issue, pending]);

  return (
    <form action={start} className="grid gap-4">
      {issue && !pending && (
        <Alert
          ref={feedback}
          tabIndex={-1}
          className="text-left"
          variant={issue === "cancelled" ? "warning" : "error"}
          title={
            issue === "cancelled"
              ? "Se ha cancelado el inicio de sesión"
              : "No se ha podido iniciar sesión"
          }
        >
          Puedes volver a intentarlo con Google.
        </Alert>
      )}
      <Button
        type="submit"
        variant="secondary"
        pending={pending}
        className="w-full bg-surface-container-low! text-on-surface-variant! enabled:hover:bg-surface-container-high! [&_svg]:size-5!"
        startIcon={<GoogleMark />}
      >
        {pending ? "Conectando con Google…" : "Continuar con Google"}
      </Button>
      <p role="status" className="sr-only">
        {pending ? "Conectando con Google. Espera un momento." : ""}
      </p>
    </form>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
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
