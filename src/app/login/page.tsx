import type { Metadata } from "next";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { Badge } from "@/lib/components/badge/badge";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { Surface } from "@/lib/components/surface/surface";
import { GoogleSignInForm } from "./google-sign-in-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | MyClinics",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { signIn } = await searchParams;
  const issue = signIn === "cancelled" || signIn === "failed" ? signIn : null;

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
          <GoogleSignInForm initialIssue={issue} />
        </Surface>
      </PageContainer>
      <AppFooter identity="© MyClinics" />
    </div>
  );
}
