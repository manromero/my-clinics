# Task 02 — Reuse the last clinic in new activities

Status: `in_progress`

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

## Execution context

- Readiness: approved scope and criteria are actionable. The activity form and
  existing save result are on `develop`. Both dedicated synthetic accounts
  signed in and opened the Activity page in isolated Chrome sessions.
- Branch: `feature/reuse-last-activity-clinic`, based on
  `90d7682ba5a937c575617d498c6b317f368d663a` from `origin/develop`.
- Sources: see the requirements and S03 links above, the
  [architecture](../../architecture.md), and the
  [signed-in validation procedure](../../supabase.md#local-signed-in-validation).
  The relevant code is under `src/app/activity/`.
- Verified: `SavedActivityResults` handles the save result, and `ActivityForm`
  initializes the clinic and date from the existing route data or edit record.
  The results sit beneath a scope-keyed boundary. Check that visit state
  survives changes within Activity and resets on leaving or changing account.
- Hypothesis: route-local client state above the scope-keyed results can keep
  the preference for the intended visit. Confirm the lifecycle in the browser.
- Keep the existing date behavior, edit defaults, and persistence. Use each
  role's own fixture account and clean up only the temporary records it creates.
- Open product questions: none. Correction rounds used: 0.

## Progress notes

Implementation started.
