import { ActivityFixtureSessionProvider } from "../_components/activity-fixture-session";
import { fixtureRows } from "../_lib/fixture-activity";

export default function ActivityPreviewLayout({
  children,
}: LayoutProps<"/activity/preview">) {
  if (process.env.NODE_ENV !== "development") return children;

  return (
    <ActivityFixtureSessionProvider initialRows={fixtureRows}>
      {children}
    </ActivityFixtureSessionProvider>
  );
}
