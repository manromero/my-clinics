# Task 02 — Validate clinic deletion with an in-memory data source

Status: `in_progress`

## Objective

Let Ana remove a clinic that has no recorded activity while preserving any
clinic linked to activity history.

## Scope

Add an `Eliminar clínica` action to the edit form, separate from `Guardar`.
Use the shared confirmation dialog and extend the in-memory clinic contract with
a delete operation. Use synthetic activity links to exercise eligibility without
building the Activity screen. Persistent deletion belongs to the work that
connects the rule to real activity records. Keep the action unavailable on the
Supabase-backed screen until that rule can be enforced by the data source.

## Dependencies

- [Task 01](<task 01 - clinic interactions.md>).
- [S02 — Clinics](../../screens.md#s02--clinics) and the shared confirmation dialog.

## Acceptance criteria

- An active or inactive clinic is eligible for deletion only if it has no
  linked activity in any month. If activity exists, explain why deletion is
  unavailable and keep deactivation available.
- Confirming identifies the clinic by name. Canceling leaves it unchanged.
  Successful deletion removes it from the list and shows confirmation. Deleting
  the last clinic shows the empty state.
- The data source checks eligibility at deletion time and distinguishes linked
  activity from other failures. While deletion is in progress, prevent repeated
  submissions. On failure, retain the clinic and show feedback that allows retry
  when the failure is recoverable.

## Validation

Follow the [milestone validation](readme.md#delivery-and-validation). Test
eligibility, successful deletion, cancellation, linked activity, and retry.
Verify the edit and confirmation flows on the running screen at desktop and
mobile widths, including deletion of the last clinic.

## Execution context

- Ready. Task 01 was merged in [PR #37](https://github.com/manromero/my-clinics/pull/37).
  Branch `feature/clinic-deletion` starts from `develop` at
  `bb88ed57e9646b7f924d20a3037578e8d16b7f25`.
- The `/clinics` preview, clinic contract, in-memory adapter, and existing
  tests live in `src/app/clinics`. The shared `ConfirmDialog` supports destructive
  actions, cancellation, and pending and error feedback.
- Follow S02 and the Alexandria and Stitch references. The approved task supplies
  the deletion behavior. Supabase integration and real activity records are out of scope.
- Validate the source rule and UI behavior with tests, then exercise the running
  edit and confirmation flows on desktop and mobile. Capture evidence for the PR.
- Open questions: none. Correction rounds used: 1.

## Progress notes

Implemented in [PR #38](https://github.com/manromero/my-clinics/pull/38).
Implementation and initial independent review of
`9363e51ecc10c0fe905bbbab1755e45604dc591a` passed `pnpm lint`,
`pnpm typecheck`, `pnpm format:check`, `pnpm build`, and `pnpm test`
(212 tests). Both roles exercised the standard deletion flows in Chrome at
1440 × 900 and 390 × 844.

The initial review found one blocker (CD-01). A long clinic name displaced
the title and beginning of the name outside the visible confirmation dialog
at the narrow viewport. Round 1 addresses this case and requires independent
re-verification.
