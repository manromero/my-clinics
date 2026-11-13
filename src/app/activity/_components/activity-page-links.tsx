import { ActionLink } from "@/lib/components/action-link/action-link";
import { activityCount } from "../_lib/activity-format";
import { activityScopeParams, type ActivityScope } from "../_lib/activity-view";

export function ActivityPageLinks({
  scope,
  page,
  pageCount,
}: {
  scope: ActivityScope;
  page: number;
  pageCount: number;
}) {
  const query = activityScopeParams(scope);
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
        Página {activityCount.format(page)} de {activityCount.format(pageCount)}
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
