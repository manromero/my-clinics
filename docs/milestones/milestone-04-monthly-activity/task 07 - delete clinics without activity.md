# Task 07 — Delete clinics without activity

Status: `done`

## Objective

Finish the clinic deletion flow validated in Milestone 02 by connecting it to
the signed-in owner's real clinics and activity.

## Scope

- Add `Eliminar clínica` to the clinic edit form as a separate destructive
  action. Reuse the shared confirmation dialog, identify the clinic by name,
  and explain that deactivation is available when activity prevents deletion.
- Add a session-verified, owner-scoped delete operation. Use the activity
  foreign key from Task 03 to enforce the rule in the database at deletion
  time. Do not cascade or clear activity references. Keep database permissions
  limited to the operation needed by the app.
- Refresh Clinics and any affected Activity clinic options after success. A
  URL referring to a deleted clinic follows the existing invalid-filter rule.

## Dependencies

- Task 06 and the restrictive activity reference from Task 03.
- [Milestone 02 Task 02](<../milestone-02-clinic-management/task 02 - delete clinics.md>)
  for the confirmed interaction.
- [Milestone 03 Task 03](<../milestone-03-authentication/task 03 - authorize clinic access.md>)
  for owner-only clinic access and the [Supabase guide](../../supabase.md)
  for hosted validation.

## Acceptance criteria

- An owner can delete an active or inactive clinic only when it has no
  remaining activity in any month. Every saved row blocks deletion, including
  a negative or zero row outside the currently selected period. A linked
  clinic remains available for deactivation and all its activity is preserved.
- Eligibility is checked when deletion executes. If activity is added after
  confirmation opens, the operation cannot leave an orphan or remove the
  linked row. A stale request gets a clear explanation if activity now blocks
  deletion.
- Anonymous and other-account requests cannot delete the clinic or learn
  whether it has activity through the operation, including via the Data API.
- Cancel leaves the clinic unchanged. Pending deletion prevents duplicate
  submission. Success removes the clinic and shows confirmation, including
  an empty list when deleting the last clinic. A recoverable failure keeps
  the clinic visible and offers retry.

## Validation

Run application checks, build, and applicable database checks. In an approved
synthetic environment, verify ownership and direct Data API access, a clinic
with activity in a prior month, competing create/delete requests, and successful
deletion after the last linked row is removed. Exercise confirmation, cancel,
failure, and the empty clinic list on desktop and mobile; capture evidence.

## Execution context

- Task 06 is integrated in [PR #57](https://github.com/manromero/my-clinics/pull/57).
  Branch `feature/delete-persistent-clinics` starts from `develop` at
  `a0ea87039e66e6ac4b4acab3c007373e1b27549a`.
- Reuse the Milestone 02 Task 02 interaction and the shared `ConfirmDialog`.
  Follow [S02](../../screens.md#s02--clinics), the Alexandria and Stitch
  references, and the existing signed-in session guard.
- The current application grants clinic reads and writes by owner. The
  composite activity foreign key in `supabase/schemas/30-activity.sql` uses
  `ON DELETE RESTRICT`; enforce eligibility through that constraint during
  deletion. Verify the new access boundary through the Data API and cover
  both orders of competing requests.
- Both ordinary synthetic accounts can sign in and read their active fixture
  clinics in isolated Chrome sessions. Use the
  [local signed-in procedure](../../supabase.md#local-signed-in-validation)
  and the Windows system trust store for local Node requests. Hosted migration
  validation follows the [Supabase guide](../../supabase.md).
- No open product questions. Correction rounds used: 0 of 2.

## Progress notes

[Draft PR #58](https://github.com/manromero/my-clinics/pull/58) targets
`develop`. Implementation and initial independent review of
`62d822e994c61b799df330106267cc217c97bfd3` passed lint, type checking,
formatting, the production build, 282 application tests and five database
tooling tests. Hosted disposable validation passed replay, parity, upgrade,
type freshness, access tests and both concurrent create/delete orders. Both
roles exercised confirmation and cancellation in Chrome at 1440 × 900 and
390 × 844. Independent review also verified pending and retry behavior by
intercepting the request before it reached the server.

The initial review found no code or visual defects and recorded validation
blocker RV07-01 for the remaining live checks. The user authorized deployment
of `20261114120000_allow_owner_clinic_deletion.sql` to synthetic project
`lvqbrjybwstvdhaxyxyn` and two temporary accounts. Only that migration was
applied. Migration history and a second dry run confirmed the target was
current.

Both roles verified live deletion of active and inactive clinics, the
last-clinic empty state, prior-month activity added after confirmation opened,
deactivation with history preserved, retry after an intercepted failure, and
Activity clinic options and URL refresh. Direct Data API probes confirmed
anonymous and other-account isolation and denied direct table deletion. Both
temporary accounts and their test data were removed and verified absent.
Independent review at `58f84e3aec22dc54ff8cd4f71541845df3d94f66` closed
RV07-01. No blocking or optional findings remain. Correction rounds used:
0 of 2.

[PR #58](https://github.com/manromero/my-clinics/pull/58) contains the check
results and desktop and mobile evidence. Human approval and manual merge
into `develop` are pending.
