# Task 01 — Connect the summary to Supabase

Status: `pending`

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

The user approved the milestone plan. Implementation is pending.
