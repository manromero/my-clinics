# Task 01 — Reorder the signed-in navigation

Status: `done`

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

[PR #63](https://github.com/manromero/my-clinics/pull/63) implements the approved
navigation order. Lint, type checking, formatting, the production build, and all
287 tests passed. The PR contains verified desktop and mobile captures.

Independent review at `e80c99d2d8a3ca3e35a5d66a3409c4a24c44c1fb` verified the
three destinations, visible keyboard focus and order, the active link on each
screen, signed-in entry to the current Activity month, and direct and contextual
Summary URLs. The existing authentication tests covered the successful callback.
The review closed its initial evidence gap after rerunning the browser check
with a dedicated fixture. No code corrections or open findings remain.
Human approval and manual merge are pending.
