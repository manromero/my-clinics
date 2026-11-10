# Task 08 — Edit, deactivate and reactivate persistent clinics

Status: `in_progress`

## Objective

Persist clinic edits and state changes without losing recoverable form state.

## Scope

Add an edit form, including active state, and connect it to the Supabase Data API
through Next.js server code. Use the
[hosted synthetic development exception](../../supabase.md#synthetic-development-rollout).
Persistent deletion is separately scoped. Authentication, authorization, RLS and
permissions remain the final gate.

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
- All updates use the typed Supabase client on the server. Changing defaults does not rewrite
  historical data. Persistent deletion remains unavailable until its own rule can
  be enforced against activity references.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation). Test updates,
normalization, percentage bounds/precision, conflicts, missing records, cancellation
and failure/retry with hosted development Supabase. Run database/type checks as
applicable. Verify edit, deactivate, reactivate, cancel and retry
on desktop/mobile against S02 and capture evidence. Run application checks and
production build. Security acceptance remains pending the final task.

## Execution context

- Ready for implementation. Task 07 was merged in
  [PR #43](https://github.com/manromero/my-clinics/pull/43). Branch
  `feature/update-persistent-clinics` starts at
  `b97aabd40f33ba1a215cc237d0ec39ecf2370ca4` on `develop`.
- Use the route-local create form and saved list in `src/app/clinics` as the
  starting point. Preserve the name counter, Spanish validation, pending lock,
  and field error behavior from Task 07. Follow [S02](../../screens.md#s02--clinics)
  and its Alexandria and Stitch references for the edit dialog and state control.
- The current list transports bigint IDs as strings. Scope the typed update to
  the selected ID, verify a matched row before reporting success, and use the
  normalized unique index to surface duplicate names including concurrent writes.
  Existing development grants already allow updates to `name`, `percentage`, and
  `active`. Expect an application-only change with no generated type changes.
- The local application configuration targets the approved hosted synthetic
  development project. Verify connectivity and use isolated, identifiable
  synthetic fixtures for live checks. Preserve existing rows and verify fixture
  cleanup. The Task 07 name-length migration was not applied to shared development
  at delivery; validate the server limit independently of that migration.
- Run application checks and the production build. Verify hosted persistence,
  cancellation, conflicts, missing rows and failure/retry, plus desktop and
  mobile behavior and evidence. No open product decisions. Correction rounds
  used: 0.

## Progress notes

Implementation assigned on 2026-11-10.
