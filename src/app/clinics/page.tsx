import type { Metadata } from "next";
import { Suspense } from "react";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { SavedClinics } from "./saved-clinics";

export const metadata: Metadata = {
  title: "Clínicas | MyClinics",
};

export default function ClinicsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader variant="public" />
      <PageContainer as="main" className="flex-1 space-y-8">
        <PageHeader
          eyebrow="Configuración de centros"
          title="Gestión de clínicas"
          description="Consulta tus clínicas y sus porcentajes por defecto. Los cambios de porcentaje se aplican a las actividades nuevas."
        />
        <p className="text-sm text-on-surface-variant">
          Consulta de clínicas guardadas. La creación y edición estarán
          disponibles próximamente.
        </p>
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
