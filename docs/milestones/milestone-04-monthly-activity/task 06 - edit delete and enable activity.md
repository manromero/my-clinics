# Task 06 — Connect edits and deletion and enable Activity

Status: `done`

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

[Draft PR #57](https://github.com/manromero/my-clinics/pull/57) contains the
implementation and desktop and mobile evidence. Lint, type checking,
formatting, 274 tests, and the production build passed at `b03ef50`. Hosted
checks covered owner writes, saved rates, month and clinic moves, deletion and
retry, and isolation through the app and Data API. The Google handoff passed
live, and the successful callback passed with a controlled PKCE exchange.
Interactive Google provider return was unavailable.

Independent review of `b03ef50` against `cb694fe` found blocker R06-01:
an existing tab still showed the former account's Activity draft, rows, totals
and identity after a rejected stale write, and Clinics showed the former
account's records on returning to the tab after a same-origin account switch.
The reviewer independently passed application checks and verified the remaining
hosted and visual cases.

Correction round 1 at `04434dd` fixed R06-01. Independent review passed lint,
type checking, formatting, 275 tests and the production build. The reviewer
verified that stale writes, real tab switches and cross-tab sign-out clear the
prior account from both signed-in routes. The reviewer found blocker R06-02:
pressing Escape while the session retry dialog is visible could close a
concealed Activity dialog and discard a draft before retry succeeds.

Correction round 2 fixed R06-02 at `c971175`. Independent review verified both
findings closed and repeated the keyboard and touch recovery checks for create,
edit and delete, stale writes, account switches and cross-tab sign-out. Lint,
type checking, formatting, 275 tests and the production build passed. The
reviewer inspected fresh desktop and mobile captures. All marked activity was
removed. Two empty, owner-scoped synthetic clinics remain for reassignment
validation. [PR #57](https://github.com/manromero/my-clinics/pull/57) holds the
detailed validation and evidence. Human approval and manual merge are pending.

## Execution context

- Readiness verified against the approved task, delivered Tasks 02–05 and 05a,
  and the project's requirements and screen references. The generated client
  exposes `update_activity` and `delete_activity`.
- Branch `feature/edit-delete-activity` from `develop` at
  `cb694feb635564ccaf13f51b314d8ca1572a39bf`.
- Primary integration points are the Activity route and its shared form, the
  sign-in page and auth callback, and the signed-in navigation. Check the
  Activity history guard and route caching against sign-out and account changes.
- Sources: [requirements](../../requirements.md#activity),
  [S03](../../screens.md#s03--monthly-activity),
  [visual references](../../screens.md#visual-design-references), and the
  [local signed-in procedure](../../supabase.md#local-signed-in-validation).
- Preflight verified two distinct ordinary accounts and active fixture clinics
  on the approved synthetic project, plus controllable isolated Chrome sessions.
  On this workstation, Node requests required the Windows system trust store.
  Each role establishes its own fresh sessions and verifies hosted results
  without retaining credentials or modifying unrelated fixtures.
- No open blockers. Correction rounds used: 2 of 2.
