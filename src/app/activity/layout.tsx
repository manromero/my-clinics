import { ActivityNavigationFocusProvider } from "./_components/activity-navigation-focus";

export default function ActivityLayout({ children }: LayoutProps<"/activity">) {
  return (
    <ActivityNavigationFocusProvider>
      {children}
    </ActivityNavigationFocusProvider>
  );
}
