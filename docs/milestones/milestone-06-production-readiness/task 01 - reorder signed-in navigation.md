# Task 01 — Reorder the signed-in navigation

Status: `pending`

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

## Progress notes

Scope approved. Awaiting implementation assignment.
