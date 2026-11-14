import { ActionLink } from "@/lib/components/action-link/action-link";
import { recordCount } from "@/lib/format/amounts";
import {
  monthlyScopeParams,
  type MonthlyScope,
} from "@/lib/monthly-scope/monthly-scope";

export function ActivityPageLinks({
  scope,
  page,
  pageCount,
}: {
  scope: MonthlyScope;
  page: number;
  pageCount: number;
}) {
  const query = monthlyScopeParams(scope);
  return (
    <nav
      aria-label="Páginas de actividad"
      className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 xl:px-6 xl:pb-4"
    >
      {page > 1 && (
        <ActionLink
          prefetch={false}
          href={`/activity?${query}${page > 2 ? `&page=${page - 1}` : ""}`}
        >
          Anterior
        </ActionLink>
      )}
      <span className="font-label text-label tabular-nums">
        Página {recordCount.format(page)} de {recordCount.format(pageCount)}
      </span>
      {page < pageCount && (
        <ActionLink
          prefetch={false}
          href={`/activity?${query}&page=${page + 1}`}
        >
          Siguiente
        </ActionLink>
      )}
    </nav>
  );
}
