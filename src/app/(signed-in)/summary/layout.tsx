import { MonthlyScopeFocusProvider } from "@/lib/components/monthly-scope-filters/monthly-scope-focus";

export default function SummaryLayout({ children }: LayoutProps<"/summary">) {
  return <MonthlyScopeFocusProvider>{children}</MonthlyScopeFocusProvider>;
}
