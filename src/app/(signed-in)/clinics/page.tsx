import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { requireSupabaseSession } from "@/lib/supabase/session";
import { ClinicCreation } from "./clinic-creation";
import { SavedClinics } from "./saved-clinics";
import { SignedInPage } from "../_components/signed-in-history-guard";

export const metadata: Metadata = {
  title: "Clínicas | MyClinics",
};

export default async function ClinicsPage() {
  const { user, context } = await requireSupabaseSession();
  return (
    <SignedInPage
      ownerId={user.id}
      context={context}
      renderedAt={context.verifiedAt}
      renderId={crypto.randomUUID()}
    >
      <PageContainer as="main" className="flex-1 space-y-8">
        <ClinicCreation />
        <Suspense
          fallback={
            <LoadingState label="Cargando clínicas…" variant="region" />
          }
        >
          <SavedClinics ownerId={user.id} />
        </Suspense>
      </PageContainer>
    </SignedInPage>
  );
}
