import { ActionLink } from "../action-link/action-link";
import { PageContainer } from "../page-container/page-container";

export type AppFooterProps = {
  identity: string;
  metadata?: string;
  navigation?: {
    label: string;
    links: readonly { href: string; label: string }[];
  };
};

export function AppFooter({ identity, metadata, navigation }: AppFooterProps) {
  const hasLinks = navigation && navigation.links.length > 0;

  return (
    <footer className="w-full bg-surface-container-low font-label text-caption text-on-surface-variant">
      <PageContainer
        className={
          hasLinks
            ? "flex flex-col items-center justify-between gap-3 py-[1.125rem]! text-center md:flex-row md:gap-6 md:text-left"
            : "py-6! text-center"
        }
      >
        <div className="flex min-w-0 flex-col items-center justify-center gap-2 md:flex-row">
          <p>{identity}</p>
          {metadata && (
            <>
              <span
                aria-hidden="true"
                className="hidden text-outline-variant md:inline"
              >
                •
              </span>
              <p>{metadata}</p>
            </>
          )}
        </div>
        {hasLinks && (
          <nav
            aria-label={navigation.label}
            className="max-w-full md:max-w-1/2"
          >
            <ul className="flex flex-wrap justify-center gap-x-4 md:justify-end">
              {navigation.links.map(({ href, label }) => (
                <li key={JSON.stringify([href, label])} className="max-w-full">
                  <ActionLink href={href} className="text-caption!">
                    {label}
                  </ActionLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </PageContainer>
    </footer>
  );
}
