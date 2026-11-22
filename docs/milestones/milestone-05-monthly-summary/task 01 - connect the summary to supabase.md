# Task 01 — Connect the summary to Supabase

Status: `done`

## Objective

Replace temporary figures with the signed-in user's saved activity totals and
connect Activity and Summary while preserving their shared filters.

## Scope

- Read the owner's clinics and existing `activity_period_totals` RPC on the
  server using the established authenticated Supabase client and RLS. Use the
  same half-open calendar date range as Activity and the grouped totals for the
  entire period, independent of Activity pagination. Read all clinic metadata
  required for the breakdown.
- Combine clinic metadata and grouped totals by stable string ID in the
  summary model. Preserve decimal precision; sum signed prices and the stored
  rounded gross and net amounts. Count all saved rows. Never infer totals from
  current clinic percentages or IRPF settings.
- Link Activity to Summary and back with the same year, month, and clinic.
  Clinic rows with activity link to Activity for their own clinic and the
  selected month. Do not carry Activity pagination into Summary.
- Remove the fixture source and its temporary label. Handle loading, zero
  activity, no eligible clinics, and read failure with retry for the same
  selection.

## Dependencies

- Task 00 and the Milestone 04 hosted activity schema and totals RPC.
- [Monthly summary requirements](../../requirements.md#monthly-summary)
  and the [Supabase guide](../../supabase.md).

## Acceptance criteria

- Summary and Activity totals match for the same year, month, and clinic,
  including months with more records than one Activity page. Number of records
  includes zero and negative entries. Both earnings modes and historical rates
  are reflected in the saved totals.
- Active clinics without rows contribute zero. Inactive clinics with rows remain
  visible, and an inactive clinic with no rows does not appear in the breakdown.
  Following links in either direction preserves the expected scope.
- Creating, editing, moving, or deleting an entry updates the affected summary
  on the next visit, including when returning via browser history.
- Signed-out or expired sessions and other accounts cannot access private data,
  including via a direct clinic URL or browser history after switching accounts.
  A read failure never displays zeros or fixtures as though the read succeeded.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.
Exercise the signed-in flows against approved hosted synthetic data using the
[local session procedure](../../supabase.md#local-signed-in-validation).
Reconcile a known month and clinic against Activity; cover month boundaries,
exact signed totals, historical and zero rows, an activity move and deletion,
more than one Activity page, retry, and two-account isolation. Inspect and
capture desktop and mobile with saved data.

## Progress notes

The user assigned implementation under the project workflow.

[PR #60](https://github.com/manromero/my-clinics/pull/60) connects Summary to
saved activity and links both screens with the same scope. The implementer
and independent reviewer passed lint, type checking, formatting, the production
build, and 286 tests on application commit
`b4aadf8cc83df4727197ff14d31e212ca4b633b1`. Both reconciled saved amounts across
Activity pagination and verified month boundaries, clinic eligibility, updates
through browser history, retry, and account isolation. Both inspected desktop
and narrow layouts; the PR includes four verified inline screenshots.
No blocking findings or correction rounds. PR #60 was merged into `develop`.

## Execution context

- Ready: Task 00 is merged in [PR #59](https://github.com/manromero/my-clinics/pull/59).
  Branch: `feature/saved-monthly-summary`. Base: `8434e63ecb8e806fb6bbef6f616efd212d0ded47`.
- Activity already reads all owned clinics by keyset and uses a half-open
  calendar range and `activity_period_totals`. The hosted RPC contract in
  `supabase/schemas/30-activity.sql` carries amounts, counts, and clinic keys
  as strings, including in its grouped JSON. Reuse the shared scope controls
  and preserve the existing signed-in session/history protection.
- Entry points: `src/app/summary`, `src/app/activity`,
  `src/lib/monthly-scope`, and the signed-in history guard. Use the
  [S03 and S04 screen specifications](../../screens.md#s03--monthly-activity)
  and the [visual references](../../screens.md#visual-design-references).
- No schema, migration, or generated type change is expected. Verify freshness
  after writes through actual history navigation; whether additional route
  invalidation is needed is an implementation question.
- Readiness: both dedicated fixture accounts independently signed in, verified
  their active clinic, and loaded Activity in isolated Chrome sessions against
  the approved hosted synthetic project. Follow the
  [local signed-in procedure](../../supabase.md#local-signed-in-validation).
- Open product questions: none. Correction rounds used: 0 of 2.
