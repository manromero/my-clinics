# Task 04 — Connect the activity list and totals

Status: `pending`

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

Proposed; implementation has not started.
