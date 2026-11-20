import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ActionLink } from "@/lib/components/action-link/action-link";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { MonthlyScopeFilters } from "@/lib/components/monthly-scope-filters/monthly-scope-filters";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import {
  monthName,
  monthlyPeriodFromQuery,
  monthlyPeriodParams,
  monthlyScopeParams,
  type MonthlyPeriod,
  type MonthlyQuery,
} from "@/lib/monthly-scope/monthly-scope";
import { requireSupabaseSession } from "@/lib/supabase/session";
import { SignedInPage } from "../_components/signed-in-history-guard";
import { SummaryLoadError } from "./_components/summary-load-error";
import { SummaryResults } from "./_components/summary-results";
import { readSummary } from "./_lib/read-summary";

export const metadata: Metadata = {
  title: "Resumen mensual | MyClinics",
  robots: { index: false },
};

async function SavedSummary({
  query,
  period,
}: {
  query: MonthlyQuery;
  period: MonthlyPeriod;
}) {
  const data = await readSummary(period, query.clinic);
  if (!data) {
    return (
      <>
        <PageHeader title="Resumen mensual" />
        <SummaryLoadError />
      </>
    );
  }

  const { scope, clinicOptions } = data;
  const { year, month } = monthlyPeriodParams(scope);
  const scopeParams = monthlyScopeParams(scope);
  if (
    query.year !== year ||
    query.month !== month ||
    query.clinic !== (scope.clinicId ?? undefined) ||
    query.page !== undefined
  ) {
    redirect(`/summary?${scopeParams}`);
  }

  const clinic = clinicOptions.find(({ id }) => id === scope.clinicId);
  return (
    <>
      <div className="grid items-end gap-6 rounded-2xl bg-surface-container-lowest p-5 sm:p-7 xl:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <PageHeader
            title="Resumen mensual"
            className="[&_h1]:sm:text-headline"
            metadata={
              <p role="status">
                <span className="inline-block first-letter:uppercase">
                  {monthName(scope.month)} de {year}
                </span>
                {" · "}
                {clinic ? clinic.name : "Todas las clínicas"}
                {clinic && !clinic.active && " (inactiva)"}
              </p>
            }
          />
          <ActionLink href={`/activity?${scopeParams}`} variant="secondary">
            Ver actividad del periodo
          </ActionLink>
        </div>
        <MonthlyScopeFilters
          path="/summary"
          label="Filtros del resumen"
          scope={scope}
          clinicOptions={clinicOptions}
        />
      </div>
      <SummaryResults data={data} />
    </>
  );
}

export default async function SummaryPage({
  searchParams,
}: PageProps<"/summary">) {
  const { user } = await requireSupabaseSession();
  const query = await searchParams;
  const period = monthlyPeriodFromQuery(query);
  const loadKey = JSON.stringify([period.year, period.month, query.clinic]);

  return (
    <SignedInPage ownerId={user.id} renderId={crypto.randomUUID()}>
      <PageContainer as="main" className="flex-1 space-y-8 sm:space-y-10">
        <Suspense
          key={loadKey}
          fallback={
            <LoadingState
              label="Cargando resumen…"
              variant="region"
              indicator="skeleton"
            />
          }
        >
          <SavedSummary query={query} period={period} />
        </Suspense>
      </PageContainer>
    </SignedInPage>
  );
}
