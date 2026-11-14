# Task 00 — Build the summary with fixtures

Status: `pending`

## Objective

Make the responsive Monthly Summary screen available from the signed-in
main menu for visual and interaction review with synthetic data.

## Scope

- Add the protected `/summary` route and the active `Resumen` navigation item.
- Build the S04 header, filter controls, totals cards, clinic comparison, and
  per-clinic breakdown with its total row. Reuse shared components and the
  Activity URL scope. Use a single view model for fixture and future saved data.
- Label the screen's synthetic data clearly and keep the fixtures isolated from
  Activity and Supabase. Defer context links between the two screens until
  Task 01 so fixture clinic IDs do not lead to real Activity filters.

## Dependencies

- Milestone 04 navigation and period/filter contract.
- [S04 specification](../../screens.md#s04--monthly-summary),
  [visual references](../../screens.md#visual-design-references), and
  [architecture guidance](../../architecture.md).

## Acceptance criteria

- The default period is the current Madrid month. Selecting a period and clinic
  updates the visible scope and all figures together, and a reload preserves it.
- Fixtures exercise multiple clinics, an inactive clinic with activity, an
  active clinic with no entries, signed and zero entries, and an empty scope.
  Zero and negative values remain legible in the comparison and breakdown.
- The layout and controls work at desktop and narrow mobile widths with
  keyboard navigation and visible focus. No PDF or Liquidaciones controls
  appear.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.
Exercise signed-in menu navigation, filters, reload, and the empty scope live.
Inspect and capture desktop and mobile views against the S04 reference.

## Progress notes

The user approved the milestone plan. Implementation is pending.
