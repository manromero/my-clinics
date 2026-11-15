# Task 02 — Reuse the last clinic in new activities

Status: `pending`

## Objective

Make consecutive entries quicker by preselecting the last clinic when the
user reopens the create activity modal.

## Scope

- When a new activity saves successfully, remember its clinic for the next
  time the user opens the create modal during the same Activity visit.
- Preselect that clinic if it is still active and available, and let the
  user choose another. Before a successful creation or if the remembered
  clinic is unavailable, use the existing default.
- Apply this only to the create modal. Keep the existing date default.

## Dependencies

- [Saving and date defaults](../../requirements.md#saving-and-date-defaults)
  and [S03 — Monthly activity](../../screens.md#s03--monthly-activity).
- Existing create modal and its successful save result.

## Acceptance criteria

- Save an activity for Clinic A and reopen the create modal. Clinic A is
  selected. Choose Clinic B, save, and reopen again. Clinic B is selected,
  ready for the next creation.
- Before the first successful creation, or if the remembered clinic is
  no longer eligible, the modal uses the existing default. The value is
  scoped to the current signed-in Activity visit.
- Cancelling a creation, a failed save, or editing an existing activity
  leaves the remembered clinic as it was. The edit modal opens with
  the saved record's own clinic and date.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.
With signed-in synthetic data, exercise successive saves with the same and
different clinics, cancel, a failed save, and
editing an existing record. Confirm that the date default still works.
Check the create and edit forms and capture
[desktop and mobile evidence](../../development-workflow.md#visual-pr-evidence).

## Progress notes

Scope approved. Awaiting implementation assignment.
