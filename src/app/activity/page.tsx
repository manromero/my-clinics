import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { ActivityScreen } from "./_components/activity-screen";
import {
  activityPeriodParams,
  activityScopeParams,
} from "./_lib/activity-view";
import {
  activityPreviewFromQuery,
  fixtureActivity,
} from "./_lib/fixture-activity";

export const metadata: Metadata = {
  title: "Actividad mensual | MyClinics",
  robots: { index: false },
};

export default async function ActivityPage({
  searchParams,
}: PageProps<"/activity">) {
  if (process.env.NODE_ENV !== "development") notFound();

  const query = await searchParams;
  const preview = activityPreviewFromQuery(query.preview);
  const data = fixtureActivity(query, preview);
  const { year, month } = activityPeriodParams(data.scope);
  if (
    query.year !== year ||
    query.month !== month ||
    query.clinic !== (data.scope.clinicId ?? undefined) ||
    query.preview !== preview
  ) {
    redirect(`/activity?${activityScopeParams(data.scope, preview)}`);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        variant="signed-in"
        currentHref="/activity"
        availableDestinations={["/activity", "/clinics"]}
        account={{
          identity: {
            displayName: "Ana · Vista previa",
            timezone: "Europe/Madrid",
          },
        }}
      />
      <ActivityScreen data={data} preview={preview} />
      <AppFooter
        identity="MyClinics"
        metadata="Vista previa · Datos sintéticos"
      />
    </div>
  );
}
