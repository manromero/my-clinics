# Task 08 — Edit, deactivate and reactivate persistent clinics

Status: `pending`

## Objective

Persist clinic edits and state changes without losing recoverable form state.

## Scope

Extend the existing repository, service and server entry point with updates and
connect the edit form, including active state. Retain the in-memory preview under
the same service. Use hosted development synthetic data only, with Data API disabled. Persistent deletion is separately
scoped; authentication, authorization, RLS and permissions remain the final gate.

## Dependencies

- [Task 07](<task 07 - create persistent clinics.md>).
- [Clinic requirements](../../requirements.md#clinics),
  [saving requirements](../../requirements.md#saving-and-date-defaults), and
  [S02](../../screens.md#s02--clinics).

## Acceptance criteria

- Save persists name, percentage and active state for the selected stable clinic
  ID. Reload retains edits, deactivation and reactivation; inactive clinics remain
  listed. Cancel writes nothing.
- Unchanged names are accepted; blank or normalized duplicate names, concurrent
  conflicts and invalid percentages return the correct field feedback.
- A failed update preserves the entered values and selected clinic, with visible
  retry feedback. Repeated submissions are prevented and success is shown only
  after persistence. A missing/deleted record produces an explicit recoverable
  outcome rather than a false success.
- All updates use the Task 06 service boundary. Changing defaults does not rewrite
  historical data. Persistent deletion remains unavailable until its own rule can
  be enforced against activity references.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation). Test updates,
normalization, percentage bounds/precision, conflicts, missing records, cancellation
and failure/retry with hosted development Supabase. Run database/type checks and preview
regressions as applicable. Verify edit, deactivate, reactivate, cancel and retry
on desktop/mobile against S02 and capture evidence. Run application checks and
production build. Security acceptance remains pending the final task.

## Progress notes

Implementation pending assignment. Planning decision recorded on 2026-11-07;
this task definition does not start implementation.
