import type { Metadata } from "next";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { requireSupabaseSession } from "@/lib/supabase/session";
import { SignedInPage } from "../_components/signed-in-history-guard";
import { InvoiceForm } from "./invoice-form";
import { madridToday } from "./invoice-contracts";

export const metadata: Metadata = { title: "Facturas | MyClinics" };

export default async function InvoicesPage() {
  const { user, context } = await requireSupabaseSession();
  return (
    <SignedInPage
      ownerId={user.id}
      context={context}
      renderedAt={context.verifiedAt}
      renderId={crypto.randomUUID()}
    >
      <PageContainer as="main" className="flex-1 space-y-8">
        <PageHeader
          title="Facturas"
          eyebrow="Facturación"
          description="Prepara los datos de emisión de tus facturas. El importe bruto se introduce de forma independiente de la actividad mensual."
        />
        <InvoiceForm today={madridToday()} state={{ status: "unavailable" }} />
      </PageContainer>
    </SignedInPage>
  );
}
