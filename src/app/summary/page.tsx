import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { Badge } from "@/lib/components/badge/badge";
import { MonthlyScopeFilters } from "@/lib/components/monthly-scope-filters/monthly-scope-filters";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import {
  monthName,
  monthlyPeriodFromQuery,
  monthlyPeriodParams,
  monthlyScopeParams,
} from "@/lib/monthly-scope/monthly-scope";
import { requireSupabaseSession } from "@/lib/supabase/session";
import { SignedInHeader } from "../_components/signed-in-header";
import { SignedInHistoryGuard } from "../_components/signed-in-history-guard";
import { SummaryResults } from "./_components/summary-results";
import { getSummaryFixtures } from "./_lib/summary-fixtures";

export const metadata: Metadata = {
  title: "Resumen mensual | MyClinics",
  robots: { index: false },
};

export default async function SummaryPage({
  searchParams,
}: PageProps<"/summary">) {
  const { user } = await requireSupabaseSession();
  const query = await searchParams;
  const period = monthlyPeriodFromQuery(query);
  const data = getSummaryFixtures(period, query.clinic);
  const { scope, clinicOptions } = data;
  const { year, month } = monthlyPeriodParams(scope);
  if (
    query.year !== year ||
    query.month !== month ||
    query.clinic !== (scope.clinicId ?? undefined)
  ) {
    redirect(`/summary?${monthlyScopeParams(scope)}`);
  }

  const name = user.user_metadata?.full_name;
  const displayName =
    (typeof name === "string" && name.trim()) || user.email || "Usuario";
  const clinic = clinicOptions.find(({ id }) => id === scope.clinicId);

  return (
    <SignedInHistoryGuard key={user.id} ownerId={user.id}>
      <SignedInHeader
        currentHref="/summary"
        displayName={displayName}
        email={user.email}
      />
      <PageContainer as="main" className="flex-1 space-y-8 sm:space-y-10">
        <div className="grid items-end gap-6 rounded-2xl bg-surface-container-lowest p-5 sm:p-7 xl:grid-cols-[1fr_auto]">
          <PageHeader
            title="Resumen mensual"
            className="[&_h1]:sm:text-headline"
            metadata={
              <>
                <p role="status">
                  <span className="inline-block first-letter:uppercase">
                    {monthName(scope.month)} de {year}
                  </span>
                  {" · "}
                  {clinic ? clinic.name : "Todas las clínicas"}
                  {clinic && !clinic.active && " (inactiva)"}
                </p>
                <Badge variant="informational" dot>
                  Datos sintéticos
                </Badge>
              </>
            }
          />
          <MonthlyScopeFilters
            path="/summary"
            label="Filtros del resumen"
            scope={scope}
            clinicOptions={clinicOptions}
          />
        </div>
        <SummaryResults data={data} />
      </PageContainer>
      <AppFooter
        identity="MyClinics"
        metadata="Entorno de desarrollo · Datos sintéticos"
      />
    </SignedInHistoryGuard>
  );
}
