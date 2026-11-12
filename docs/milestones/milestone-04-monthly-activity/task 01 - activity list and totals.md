# Task 01 — Build the activity list and totals

Status: `in_progress`

## Objective

Make the selected period useful to review with a responsive list and totals
driven by synthetic data.

## Scope

- Use a readable desktop table and a narrow layout that keeps all required
  details and row actions accessible. Bind the list and totals to the same
  normalized period and clinic scope from Task 00.
- Provide fixtures for percentage and direct earnings, same-day entries,
  positive, negative, and zero amounts, optional descriptions, and active and
  inactive clinics. Exercise loading, no matches, no active clinics, and
  load failure. Prepare row selection for the Task 02 actions.

## Dependencies

- Task 00.
- [S03 activity list](../../screens.md#activity-list) and
  [confirmed requirements](../../requirements.md#monthly-summary).

## Acceptance criteria

- Show dates in a consistent chronological order with a stable tie-breaker.
  Each row exposes date, clinic and inactive state where relevant, concept,
  original price, mode, applied percentage where relevant, gross earnings,
  applied IRPF, net earnings, and edit/delete controls.
- Format dates, amounts, and rates for Spain. Distinguish a negative price or
  negative gross earnings with a visible label and accent; retain the sign.
- Totals show price, gross, net, and record count for the selected scope.
  Count zero and negative rows and sum signed, rounded row earnings. Changing
  the filter updates the totals and list together.
- Distinguish an empty month or filter from a load error. When no clinic is
  active, explain how to create or reactivate one, link to Clinics, and still
  show accessible history. Edit and delete become interactive in Task 02.

## Validation

Run the application checks and build. Compare fixture amounts and counts
against expected values; exercise the empty and error states, filter changes,
keyboard access, and row details live. Capture desktop and mobile evidence.

## Progress notes

Implementation assigned after Task 00 merged in [PR #50](https://github.com/manromero/my-clinics/pull/50).

## Execution context

- Ready. The approved scope, acceptance criteria and Task 00 dependency are
  available on `develop`.
- Branch: `feature/activity-list-and-totals`; base:
  `42c155519297470ed89c4e48b79ba9b0d8863be8`.
- Reuse the normalized scope and view data in `src/app/activity/_lib/`, and
  the route composition and shared components in `src/app/activity/`.
- Follow the [currency and rounding requirements](../../requirements.md#currency-and-rounding)
  and the [S03 specification and supplied design references](../../screens.md#s03--monthly-activity).
  Keep signed totals in exact cents and use stored applied rates.
- Keep fixture states within the development preview. Exercise loading,
  failure, empty results and inactive-only history live, alongside the
  populated fixtures and keyboard filter navigation. Check production isolation.
- No open product questions. Correction rounds used: 0 (of 2).
