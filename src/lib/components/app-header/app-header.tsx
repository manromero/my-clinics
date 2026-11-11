import { Brand } from "../brand/brand";
import {
  MainNavigation,
  type MainDestination,
} from "../main-navigation/main-navigation";
import { PageContainer } from "../page-container/page-container";
import { UserMenu, type UserMenuProps } from "../user-menu/user-menu";

export type AppHeaderProps = { brandHref?: string } & (
  | { variant: "public" }
  | {
      variant: "signed-in";
      currentHref?: MainDestination;
      availableDestinations?: readonly MainDestination[];
      account: Omit<UserMenuProps, "variant">;
    }
);

export function AppHeader(props: AppHeaderProps) {
  const signedIn = props.variant === "signed-in";

  // Keep the header blur separate so the account panel can blur the page.
  return (
    <header className="relative z-10 shadow-[0_1px_8px_rgb(26_27_32/0.04)] before:absolute before:inset-0 before:-z-10 before:bg-surface/90 before:backdrop-blur-xl">
      <PageContainer
        className={
          signedIn
            ? "grid min-h-20 grid-cols-1 items-center gap-y-3 py-2! lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-6"
            : "flex min-h-20 items-center justify-between gap-4 py-2!"
        }
      >
        <div
          className={
            signedIn
              ? "z-10 col-start-1 row-start-1 min-w-0 justify-self-start max-lg:max-w-[calc(100%-6rem)]"
              : "min-w-0"
          }
        >
          <Brand description href={props.brandHref} />
        </div>
        {signedIn ? (
          <>
            <MainNavigation
              currentHref={props.currentHref}
              availableDestinations={props.availableDestinations}
              className="col-start-1 row-start-2 justify-self-center max-sm:[&_a]:px-2.5 lg:col-start-2 lg:row-start-1"
            />
            <div className="col-start-1 row-start-1 w-full max-w-sm min-w-0 justify-self-end lg:col-start-3">
              <UserMenu {...props.account} variant="responsive" />
            </div>
          </>
        ) : (
          <span className="flex shrink-0 items-center gap-2 font-label text-caption text-on-surface-variant">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 text-tertiary"
            >
              <path d="m12 3 7 3v5c0 5-4 8-7 10-3-2-7-5-7-10V6l7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span className="sr-only sm:not-sr-only">
              Acceso Profesional Clínico
            </span>
          </span>
        )}
      </PageContainer>
    </header>
  );
}
