import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AppFooter } from "@/lib/components/app-footer/app-footer";
import { AppHeader } from "@/lib/components/app-header/app-header";
import { ActivityScreen } from "../_components/activity-screen";
import {
  activityPeriodFromQuery,
  activityPeriodParams,
  activityScopeParams,
  resolveActivityScope,
} from "../_lib/activity-view";
import {
  activityPreviewFromQuery,
  fixtureClinics,
} from "../_lib/fixture-activity";

export const metadata: Metadata = {
  title: "Actividad mensual | MyClinics",
  robots: { index: false },
};

export default async function ActivityPreviewPage({
  searchParams,
}: PageProps<"/activity/preview">) {
  if (process.env.NODE_ENV !== "development") notFound();

  const query = await searchParams;
  const preview = activityPreviewFromQuery(query.preview);
  const period = activityPeriodFromQuery(query);
  const clinics = fixtureClinics(preview);
  // Historical eligibility depends on the edited rows in the client session.
  const scope = resolveActivityScope(period, query.clinic, clinics);
  const { year, month } = activityPeriodParams(period);
  if (
    query.year !== year ||
    query.month !== month ||
    query.clinic !== (scope.clinicId ?? undefined) ||
    query.preview !== preview
  ) {
    redirect(`/activity/preview?${activityScopeParams(scope, preview)}`);
  }

  const loading =
    preview === "loading"
      ? new Promise<void>((resolve) => setTimeout(resolve, 1500))
      : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        variant="signed-in"
        currentHref="/activity"
        availableDestinations={["/clinics"]}
        account={{
          identity: {
            displayName: "Ana · Vista previa",
            timezone: "Europe/Madrid",
          },
        }}
      />
      <ActivityScreen
        scope={scope}
        clinics={clinics}
        preview={preview}
        loading={loading}
      />
      <AppFooter
        identity="MyClinics"
        metadata="Vista previa · Datos sintéticos"
      />
    </div>
  );
}
