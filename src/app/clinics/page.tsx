import type { Metadata } from "next";
import { Suspense } from "react";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { requireSupabaseSession } from "@/lib/supabase/session";
import { ClinicCreation } from "./clinic-creation";
import { SavedClinics } from "./saved-clinics";
import { SignedInHeader } from "../_components/signed-in-header";
import { SignedInHistoryGuard } from "../_components/signed-in-history-guard";

export const metadata: Metadata = {
  title: "Clínicas | MyClinics",
};

export default async function ClinicsPage() {
  const { user } = await requireSupabaseSession();
  const name = user.user_metadata?.full_name;
  const displayName =
    (typeof name === "string" && name.trim()) || user.email || "Usuario";

  return (
    <SignedInHistoryGuard key={user.id} ownerId={user.id}>
      <SignedInHeader displayName={displayName} email={user.email} />
      <PageContainer as="main" className="flex-1 space-y-8">
        <ClinicCreation />
        <Suspense
          fallback={
            <LoadingState label="Cargando clínicas…" variant="region" />
          }
        >
          <SavedClinics />
        </Suspense>
      </PageContainer>
      <AppFooter
        identity="MyClinics"
        metadata="Entorno de desarrollo · Datos sintéticos"
      />
    </SignedInHistoryGuard>
  );
}
