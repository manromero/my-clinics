import { ActivityNavigationFocusProvider } from "./_components/activity-navigation-focus";
import { ActivityFixtureSessionProvider } from "./_components/activity-fixture-session";
import { fixtureRows } from "./_lib/fixture-activity";

export default function ActivityLayout({ children }: LayoutProps<"/activity">) {
  if (process.env.NODE_ENV !== "development") return children;

  return (
    <ActivityNavigationFocusProvider>
      <ActivityFixtureSessionProvider initialRows={fixtureRows}>
        {children}
      </ActivityFixtureSessionProvider>
    </ActivityNavigationFocusProvider>
  );
}
