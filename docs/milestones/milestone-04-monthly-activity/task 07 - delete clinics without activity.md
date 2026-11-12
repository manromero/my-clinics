# Task 07 — Delete clinics without activity

Status: `pending`

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

## Progress notes

Proposed; implementation has not started.
