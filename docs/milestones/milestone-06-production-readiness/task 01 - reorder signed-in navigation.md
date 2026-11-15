# Task 01 — Reorder the signed-in navigation

Status: `in_progress`

## Objective

Put clinic management first in the navigation while keeping Activity as
the default screen after sign-in.

## Scope

- Reorder the existing links to **Clínicas**, **Actividad**, and **Resumen**,
  using their current labels and destinations.
- Update the order in the applicable navigation documentation.

## Dependencies

- [Screen navigation](../../screens.md#screen-map) and the
  [existing monthly summary](../milestone-05-monthly-summary/readme.md).

## Acceptance criteria

- On desktop and mobile, the links appear in the requested order, have
  matching keyboard order, and lead to `/clinics`, `/activity`, and
  `/summary`, respectively.
- The current route is visibly highlighted and announced as the current
  page. Activity opens after sign-in even though it is the second link.
- Direct Summary links and links that carry a monthly filter still work.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.
Check all three destinations, keyboard order, and the post-sign-in landing
on desktop and mobile. Collect
[visual evidence](../../development-workflow.md#visual-pr-evidence).

## Execution context

- Ready for implementation on `feature/reorder-signed-in-navigation`, based on
  `1ca8ae4f09c9028cf6d15d6c858bea259181d0ac` from `develop`.
- [MainNavigation](../../../src/lib/components/main-navigation/main-navigation.tsx)
  renders links in its destination-list order. The
  [signed-in header](../../../src/app/_components/signed-in-header.tsx) limits
  that list to the three available screens. The
  [auth callback](../../../src/app/auth/callback/route.ts) and
  [login page](../../../src/app/login/page.tsx) already use the current Activity
  URL for signed-in entry.
- Verify route highlighting, keyboard order, and the existing Summary URLs and
  monthly context in the production build. Follow the
  [local signed-in validation procedure](../../supabase.md#local-signed-in-validation).
  Both dedicated accounts authenticated and opened isolated Chrome sessions
  during intake.
- Open product questions: none. Correction rounds used: 0 of 2.

## Progress notes

Scope approved. Implementation assigned under the standard development workflow.
