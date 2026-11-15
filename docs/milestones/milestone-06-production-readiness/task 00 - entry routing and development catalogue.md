# Task 00 — Set up entry routing and a development-only catalogue

Status: `done`

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

The user assigned implementation through the
[standard workflow](../../development-workflow.md).

[PR #62](https://github.com/manromero/my-clinics/pull/62) implements the
entry redirect and development-only catalogue. The initial review at
`57f4395298c82463d02f5e1e99d2eb47598cdc94` found R-01: the production
404 still serialized catalogue and specimen content in its HTML and
React Server Component responses.

Correction round 1 moved the production check before rendering. The independent
review at `c57f5bdeb029fc2ca17e49afa6eb53e9b4c8b11b` verified that all 27
catalogue routes return a generic 404 without specimen data in production
document, React Server Component, and prefetch responses, with and without a
session. The catalogue remains available in development.

The implementer and reviewer passed lint, type checking, formatting, and the
production build. The reviewer also passed all 31 existing authentication tests
and verified the browser flows on desktop and mobile against both server modes.
The Google handoff and callback error handling were exercised. A synthetic
session covered signed-in behavior. The PR contains the reviewed results and
verified inline evidence. No open blockers. Human approval and manual merge
are pending.

## Execution context

- Ready for implementation. The task has approved scope and acceptance criteria.
  Both dedicated fixture accounts authenticated against the approved synthetic
  Supabase project and launched isolated Chrome sessions.
- Branch `feature/entry-routing-development-catalogue`, based on
  `9e3efa3a86e4d0f02ca67f421d9d8c58429be1a5` from `origin/develop`.
- The root starter is in `src/app/page.tsx`. The existing login page routes
  valid sessions via `currentActivityHref`. The catalogue index and specimens
  share the `src/app/components` route segment.
- Confirm the HTTP results in both server modes and exercise the existing login
  and protected route behavior with the dedicated role sessions. Use the
  [local signed-in validation procedure](../../supabase.md#local-signed-in-validation).
- No open product decisions. Correction rounds used: 1.
