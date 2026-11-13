# Task 06 — Connect edits and deletion and enable Activity

Status: `pending`

## Objective

Finish persistent corrections and deletion, then make Monthly activity the
default screen for the signed-in user.

## Scope

- Connect the shared edit form and delete confirmation to the
  session-verified server operations. Refresh affected views after success,
  including both months when a row moves and both clinic scopes when it is
  reassigned. Keep the current selection and explain why a moved row may no
  longer appear there.
- Enable Activity and Clinics in signed-in navigation, preserve account and
  sign-out controls, and send successful sign-ins and already signed-in
  visits to the sign-in page to Activity for the current Madrid month.
  Remove the fixture entry point from the feature.
- Run end-to-end acceptance for the full signed-in activity flow against an
  approved synthetic environment with two separate accounts.

## Dependencies

- Task 05, the confirmation from Task 02, and the authorized edit and delete
  operations from Task 03.
- [Task 05a](<task 05a - automate hosted activity acceptance.md>) for the hosted
  browser suite used in Activity acceptance.

## Acceptance criteria

- An owner can edit current or historical rows, including rows that keep
  their inactive clinic. Price, date, or description edits retain saved
  rates; reassignment to an active clinic uses its current percentage and
  keeps the saved IRPF. Changing mode or direct amount is explicit. Reopening
  the edited row and checking affected scopes show the same saved result.
- Confirmed deletion removes only the identified activity and updates the
  scoped totals. Cancel and failed deletion retain the row. A rejected
  edit retains the draft. A missing or inaccessible row gives safe feedback
  and does not expose another account's data.
- On desktop and mobile, sign-in opens Activity, and Clinics and sign-out
  still work. No fixture data or unfinished routes appear in navigation.
  Sign-out and account changes prevent access to previously viewed data.
- Two accounts can each create and manage their own activity and cannot read,
  edit, or delete one another's records, including through direct Data API
  requests. The same account sees changes in a second session.

## Validation

Run application checks, production build, and relevant automated tests. In the
approved environment, verify create, edit, month move, clinic reassignment,
confirmed deletion, reload, retry, and two-account isolation through the app
and Data API. Capture desktop and mobile evidence and record hosted results.

## Progress notes

Proposed; implementation has not started.
