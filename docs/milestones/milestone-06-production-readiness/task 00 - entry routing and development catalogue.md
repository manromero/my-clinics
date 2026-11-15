# Task 00 — Set up entry routing and a development-only catalogue

Status: `pending`

## Objective

Make the root URL an entry point to sign-in and restrict the component
catalogue to the Next.js development server.

## Scope

- Compare the App Router redirect options and implement the simplest suitable
  server redirect from `/` to `/login`. Keep the existing behavior for someone
  who already has a valid session: land in Activity without signing in again.
- Make `/components` and all nested specimen routes unavailable outside
  development, including preview deployments running a production build.
  Keep the catalogue accessible in development and update its documentation.
- Preserve Google sign-in, its callback, and access controls on protected
  routes. Changing deployment settings or the identity provider is out of scope.

## Dependencies

- [S01 — Sign-in](../../screens.md#s01--sign-in) and the
  [component catalogue](../../components-catalogue.md).
- Consult the installed Next.js guides and the
  [redirect options](https://nextjs.org/docs/app/guides/redirecting).

## Acceptance criteria

- A signed-out visit to `/` reaches `/login` without showing the starter page.
  A signed-in visit reaches Activity for the current month in Europe/Madrid.
- Sign-in and direct visits to protected URLs behave as before, with no
  redirect loop. The root redirect works without client JavaScript.
- The catalogue index and specimen URLs work in development. In a production
  build they return not found on direct visits, including for signed-in
  users, and the app exposes no link to the catalogue.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.
Exercise the root, login, a protected URL, the catalogue index, and nested
specimens under both `pnpm dev` and `pnpm start`. Check the production
responses and the signed-in and signed-out flows in a browser.

## Progress notes

Scope approved. Awaiting implementation assignment.
