# Task 00 — Build the summary with fixtures

Status: `in_progress`

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

The user approved the milestone plan and assigned Task 00 for implementation.

[PR #59](https://github.com/manromero/my-clinics/pull/59) contains
the protected Summary route, shared filters, and fixture-only results.
Implementation and independent review verified application commit
`5e1b97d445d76483403359ae72230367a243dd90` against the base below.
`pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and all
284 unit tests passed. Signed-in Chrome checks covered scope and figures,
keyboard focus, reload, and the empty state, including Activity regression
checks. Desktop and narrow mobile visual review found no blocking defects.
No correction rounds were used. The reviewer noted that the native select can
truncate a long name on mobile; the selected name remains visible in full
in the scope heading.

The user authorized publishing the three redacted synthetic screenshots.
The PR displays the desktop, mobile, and empty-state captures inline, and all
three downloads matched the original PNGs. Human approval and manual merge
are pending.

Human review reopened the task because the clinic comparison diverged from
S04. Correction round 1 restored one rounded track per clinic on a shared
surface, with the price and net amount above it. Negative prices use a red
bar from the same left edge and keep their minus sign. Zero prices leave
the track empty. Independent review compared the running application with
S04 on desktop and narrow mobile and verified filters, focus, reload, and
zero and empty states on application commit
`e707d154e19b34126f07a9b230d72a6ec1ccf7e3`. Lint, type checking,
formatting, production build, and all 284 tests passed. No application
blockers remain. The two replacement captures await authorization for
publication in the public PR.

## Execution context

- Ready for implementation and independent review. The assignment branch is
  `feature/monthly-summary-fixtures`, based on verified `origin/develop`
  commit `7dd831e9f8245076bcf4810883ac54acc645000c`.
- Activity's page, filters, and scope helpers are under `src/app/activity`;
  identify the minimal shared boundary so both routes use the same URL contract.
  The shared navigation already defines `/summary` and the signed-in header
  controls which destinations are available. Follow Activity's session guard
  and history protection; include Summary in the session refresh proxy.
- The [milestone scope](readme.md), S04 specification, Alexandria, and the S04
  Stitch HTML and image govern the design. Keep synthetic fixtures route-local
  and preserve rounded signed row amounts when aggregating them. Do not connect
  Summary to persistent activity or expose scope links between the screens.
- Both role-specific accounts and their active clinics were verified using the
  [signed-in validation launcher](../../supabase.md#local-signed-in-validation)
  on the approved synthetic project. Use fresh role sessions for their checks.
  Node's system CA option can resolve local certificate-chain errors without
  disabling TLS verification.
- No open product decisions. Correction rounds used: 1.
