# Task 04 — Connect the activity list and totals

Status: `in_progress`

## Objective

Replace fixture reads with the signed-in user's saved activity, clinic options,
and totals. Verify the persistent view before enabling writes in the UI.

## Scope

- Verify the session and query through the existing Supabase SSR pattern
  with the user's credentials. Use the normalized URL scope and a half-open
  calendar date range for the selected month; do not convert saved dates to
  instants. Preserve exact decimal amounts and stable string IDs in the view.
- Read eligible clinic options for the month independently of the selected
  clinic and row page. Query list and totals for the same normalized scope.
  If rows are paged, make all matching rows reachable in stable order and
  compute totals over the entire scope. Avoid a per-row clinic query.
- Hook up genuine loading, empty, failure, and retry states. Keep the
  persistent route reachable for authenticated validation while leaving its
  normal navigation and sign-in destination for Task 06. Do not offer
  fixture writes from the persistent view.

## Dependencies

- Task 03, with the reviewed migration available in the approved integration
  environment.
- Task 01's list and totals and the session pattern from
  [Milestone 03](../milestone-03-authentication/readme.md).

## Acceptance criteria

- Loading another month or filter updates rows and totals together. Owners
  see their active clinics, plus inactive clinics with activity in that
  month. Empty scopes return zero totals without conflating a failed read
  with missing data.
- Rows near month and year boundaries keep their original date across
  timezones. Multiple entries with the same date retain stable order.
  A dataset exceeding a single response page yields complete totals and
  no silently omitted rows.
- A missing or expired session cannot see saved data; requesting another
  account's clinic ID or navigating back after switching accounts cannot
  expose its rows or totals. A read failure supports retry with the same
  selection and does not fall back to fixtures.

## Validation

Run application checks and build. Exercise boundary dates, filter changes,
pagination or response limits, retry, and account isolation against approved
synthetic data. Inspect and capture the persistent view on desktop and mobile.

## Progress notes

[PR #53](https://github.com/manromero/my-clinics/pull/53) is merged into
`develop`. On 2026-11-13, the user authorized applying the reviewed migration
`20261112120000_create_activity.sql` to synthetic development
(`lvqbrjybwstvdhaxyxyn`) with its Data API active. The dry run listed only that
migration. The postcheck confirmed the migration history, all four existing
clinics, activity RLS and its authenticated owner read policy, and authenticated
grants for reads and totals. Both anonymous Data API reads returned HTTP 401
with SQLSTATE `42501`.

Implementation is in [draft PR #54](https://github.com/manromero/my-clinics/pull/54).
Initial independent review of `fb4f517131be56b23f720c4a97b1c0b6f8aedbf8` passed
lint, type checking, formatting, the production build, all 275 tests, and
desktop/mobile inspection with controlled responses. B54-01 reproduced
exposure of the previous account’s rows and totals on same-document Back
navigation. B54-02 tracks pending hosted two-account validation with
populated synthetic data.

Independent re-review of `40dc08c063880149bd4b87a84892742ded4fa33d`
verified B54-01 is fixed in controlled Chrome tests, including Back and
Forward after an account change, Back from Clinics, and expired sessions.
Lint, type checking, formatting, the production build, all 275 tests, and
desktop and mobile inspection passed. B54-02 remains open and the PR stays
in draft pending validation with two authorized synthetic accounts and
populated activity in hosted Supabase.

## Execution context

- Ready. The reviewed activity migration is available on the approved synthetic
  integration target. Branch: `feature/read-persistent-activity`. Base:
  `3339ab23e04b69e44c456d467b75f0a7e636eebd` on `develop`.
- Follow the activity route and view model, the Clinics session and list pattern,
  and the [S03 specification and visual references](../../screens.md#s03--monthly-activity).
- The activity totals RPC returns exact text amounts and all clinic IDs with
  activity for an unfiltered month. Use the owner-scoped activity table with
  date and immutable ID ordering and avoid per-row clinic lookups.
- Exercise the approved criteria and capture the persistent view on desktop and
  mobile. The anonymous checks above are separate from live account isolation
  and do not verify it. No open product questions. Correction rounds used: 1.
