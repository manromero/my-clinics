import type { Metadata } from "next";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { Badge } from "@/lib/components/badge/badge";
import { Button } from "@/lib/components/button/button";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { Surface } from "@/lib/components/surface/surface";

export const metadata: Metadata = {
  title: "Iniciar sesión | MyClinics",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader variant="public" />
      <PageContainer
        as="main"
        className="grid flex-1 place-items-center py-12!"
      >
        <Surface
          as="section"
          aria-labelledby="login-title"
          className="relative w-full max-w-lg overflow-hidden px-6! pt-8! pb-6! text-center shadow-floating sm:px-12! sm:pt-10! sm:pb-8!"
          header={
            <>
              <Badge
                className="mb-5 bg-surface-container-low! tracking-wide text-tertiary! uppercase"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    focusable="false"
                  >
                    <path d="M7 9V7a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v2Zm3 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                  </svg>
                }
              >
                Portal Clínico Privado
              </Badge>
              <h1
                id="login-title"
                className="font-headline text-2xl leading-tight font-bold tracking-tight sm:text-4xl"
              >
                MyClinics Dental
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-on-surface-variant sm:text-base">
                Gestión privada de actividad y liquidación para odontólogos
              </p>
            </>
          }
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-primary via-primary-container to-tertiary"
          />
          <Button
            variant="secondary"
            disabled
            className="w-full bg-surface-container-low! text-on-surface-variant! disabled:opacity-100! [&_svg]:size-5!"
            startIcon={<GoogleMark />}
          >
            Continuar con Google
          </Button>
        </Surface>
      </PageContainer>
      <AppFooter identity="© MyClinics" />
    </div>
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
