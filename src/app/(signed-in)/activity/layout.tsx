import { MonthlyScopeFocusProvider } from "@/lib/components/monthly-scope-filters/monthly-scope-focus";
import { ActivityVisit } from "./_components/activity-visit";

export default function ActivityLayout({ children }: LayoutProps<"/activity">) {
  return (
    <MonthlyScopeFocusProvider>
      <ActivityVisit>{children}</ActivityVisit>
    </MonthlyScopeFocusProvider>
  );
}
