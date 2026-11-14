import { MonthlyScopeFocusProvider } from "@/lib/components/monthly-scope-filters/monthly-scope-focus";

export default function ActivityLayout({ children }: LayoutProps<"/activity">) {
  return <MonthlyScopeFocusProvider>{children}</MonthlyScopeFocusProvider>;
}
