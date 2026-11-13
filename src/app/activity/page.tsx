import type { Metadata } from "next";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { LoadingState } from "@/lib/components/loading-state/loading-state";
import { PageContainer } from "@/lib/components/page-container/page-container";
import { PageHeader } from "@/lib/components/page-header/page-header";
import { requireSupabaseSession } from "@/lib/supabase/session";
import { SignedInHeader } from "../_components/signed-in-header";
import { ActivityFilters } from "./_components/activity-filters";
import { ActivityLoadError } from "./_components/activity-load-error";
import { ActivityPageLinks } from "./_components/activity-page-links";
import { ActivityHistoryGuard } from "./_components/activity-history-guard";
import { SavedActivityResults } from "./_components/saved-activity-results";
import type { ActivityDraft } from "./_lib/activity-entry";
import {
  activityMonthKey,
  activityMonthName,
  activityPeriodFromQuery,
  activityPeriodParams,
  activityScopeParams,
  type ActivityPeriod,
  type ActivityQuery,
} from "./_lib/activity-view";
import { createActivity } from "./_lib/create-activity";
import { readActivity } from "./_lib/read-activity";

export const metadata: Metadata = {
  title: "Actividad mensual | MyClinics",
  robots: { index: false },
};

async function SavedActivity({
  query,
  period,
  ownerId,
}: {
  query: ActivityQuery;
  period: ActivityPeriod;
  ownerId: string;
}) {
  const data = await readActivity(period, query.clinic, query.page);
  if (!data) {
    return (
      <>
        <PageHeader title="Actividad mensual" />
        <ActivityLoadError />
      </>
    );
  }

  const { scope, clinicOptions, page, pageCount, lastEntered } = data;
  const { year, month } = activityPeriodParams(scope);
  const pageParam = page === 1 ? undefined : String(page);
  if (
    query.year !== year ||
    query.month !== month ||
    query.clinic !== (scope.clinicId ?? undefined) ||
    query.page !== pageParam ||
    query.preview !== undefined
  ) {
    const canonical = activityScopeParams(scope);
    redirect(`/activity?${canonical}${pageParam ? `&page=${pageParam}` : ""}`);
  }

  const selectedMonth = activityMonthKey(scope);
  async function createActivityAction(draft: ActivityDraft) {
    "use server";
    const result = await createActivity(selectedMonth, ownerId, draft);
    if (result.status === "saved") refresh();
    return result;
  }

  const clinic = clinicOptions.find(({ id }) => id === scope.clinicId);
  return (
    <>
      <div className="grid items-end gap-6 xl:grid-cols-[1fr_auto]">
        <PageHeader
          title="Actividad mensual"
          metadata={
            <p role="status">
              <span className="inline-block first-letter:uppercase">
                {activityMonthName(scope.month)} de {scope.year}
              </span>
              {" · "}
              {clinic ? clinic.name : "Todas las clínicas"}
              {clinic && !clinic.active && " (inactiva)"}
            </p>
          }
        />
        <ActivityFilters scope={scope} clinicOptions={clinicOptions} />
      </div>
      <SavedActivityResults
        data={data}
        lastEntered={lastEntered}
        createActivityAction={createActivityAction}
        pagination={
          pageCount > 1 && (
            <ActivityPageLinks
              scope={scope}
              page={page}
              pageCount={pageCount}
            />
          )
        }
      />
    </>
  );
}

export default async function ActivityPage({
  searchParams,
}: PageProps<"/activity">) {
  const { user } = await requireSupabaseSession();
  const query = await searchParams;
  const period = activityPeriodFromQuery(query);
  const name = user.user_metadata?.full_name;
  const displayName =
    (typeof name === "string" && name.trim()) || user.email || "Usuario";
  const loadKey = JSON.stringify([
    period.year,
    period.month,
    query.clinic,
    query.page,
  ]);

  return (
    <ActivityHistoryGuard key={user.id}>
      <SignedInHeader
        currentHref="/activity"
        displayName={displayName}
        email={user.email}
      />
      <PageContainer as="main" className="flex-1 space-y-8">
        <Suspense
          key={loadKey}
          fallback={
            <LoadingState
              label="Cargando actividad…"
              variant="region"
              indicator="skeleton"
            />
          }
        >
          <SavedActivity query={query} period={period} ownerId={user.id} />
        </Suspense>
      </PageContainer>
      <AppFooter
        identity="MyClinics"
        metadata="Entorno de desarrollo · Datos sintéticos"
      />
    </ActivityHistoryGuard>
  );
}
