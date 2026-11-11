import type { Metadata } from "next";
import { Suspense } from "react";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { ClinicCreation } from "./clinic-creation";
import { ClinicsHeader } from "./clinics-header";
import { SavedClinics } from "./saved-clinics";

export const metadata: Metadata = {
  title: "Clínicas | MyClinics",
};

export default function ClinicsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ClinicsHeader />
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
    </div>
  );
}
