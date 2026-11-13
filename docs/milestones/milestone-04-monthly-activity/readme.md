# Milestone 04 — Monthly activity

The user approved this plan. Implementation starts when each task is assigned.

## Objective

Deliver [S03 — Monthly activity](../../screens.md#s03--monthly-activity)
at `/activity`. After signing in, a professional can review the selected
month, record services and expenses, and correct or delete existing rows.
The list and its totals reflect saved data and are consistent across devices.

## Scope and boundaries

- Deliver Spanish desktop and mobile layouts, year/month and clinic filters,
  totals for the selected scope, and complete create, edit, and delete flows.
- Use the owner's clinics and activity only. When S03 is ready, make it the
  default post-sign-in destination, with navigation between Activity and
  Clinics and the existing sign-out behavior.
- S03 totals show original prices, gross earnings, net earnings, and row count.
  The dedicated [S04 — Monthly summary](../../screens.md#s04--monthly-summary),
  including its per-clinic breakdown and cross-links, is deferred. Preserve
  period and clinic in the URL so S04 can reuse that context later. Do not
  expose links to unfinished destinations.
- Use the initial 15% IRPF rate for new entries, resolved by the trusted write
  path and recorded on each row. Leave user-editable defaults and the
  [S05 Settings screen](../../screens.md#s05--settings) for a later milestone.
  Changing the source of the default later must not recalculate saved rows.
- Finish persistent clinic deletion from S02 after Activity is integrated.
  An owner can delete an active or inactive clinic only when no saved activity
  references it in any month. Clinics with activity can still be deactivated.
- Workbook import and CSV export are outside scope.

The [confirmed requirements](../../requirements.md) govern behavior. The
[S03 visual references](../../screens.md#visual-design-references) guide layout
and style. In particular, use the two agreed earnings modes and per-row IRPF;
the reference's sample fixed-rate labels and export control do not define scope.

## Delivery sequence

1. **UI with fixtures (00–02).** Settle the scope and layout first. Build the
   responsive list next so the form and deletion flow can be exercised from real
   row controls. Use one small route contract and synthetic fixtures rather than
   a second persistence system.
2. **Database (03).** Prove ownership, clinic eligibility, rate snapshots, and
   exact arithmetic where writes are enforced. The browser's calculation is a
   preview; a client cannot supply authoritative earnings or snapshots.
3. **Integration (04–06).** Replace fixture reads, then deliver creation as the
   first complete persisted flow. Automate its hosted browser acceptance in
   Task 05a before integrating activity corrections and deletion. Those flows
   they introduce historical-rate rules, cross-month moves, and confirmation.
   Enable S03 in the normal signed-in journey only after the complete flow is
   verified. Database design can be prepared once the contract in Task 00 is
   stable; finish Tasks 01–02 before integrating the live UI.
4. **Clinic deletion (07).** Reuse the clinic deletion flow validated in
   Milestone 02. Connect it to the real activity reference and verify that
   the database protects history even when requests race.

## Task index

| Task                                                                                                    | Status        | Direct dependencies                                                                                             |
| ------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| [00 — Define the activity page and filters](<task 00 - activity page and filters.md>)                   | `done`        | Milestones [01](../milestone-01-shared-components/readme.md) and [03](../milestone-03-authentication/readme.md) |
| [01 — Build the activity list and totals](<task 01 - activity list and totals.md>)                      | `done`        | 00                                                                                                              |
| [02 — Build the activity form and deletion confirmation](<task 02 - activity form and confirmation.md>) | `done`        | 01                                                                                                              |
| [03 — Create the activity database model](<task 03 - activity database model.md>)                       | `done`        | 02; [Milestone 03 Task 03](<../milestone-03-authentication/task 03 - authorize clinic access.md>)               |
| [04 — Connect the activity list and totals](<task 04 - read persistent activity.md>)                    | `done`        | 03                                                                                                              |
| [05 — Connect activity creation](<task 05 - create persistent activity.md>)                             | `done`        | 04                                                                                                              |
| [05a — Automate hosted activity acceptance](<task 05a - automate hosted activity acceptance.md>)        | `in_progress` | 05                                                                                                              |
| [06 — Connect edits and deletion and enable Activity](<task 06 - edit delete and enable activity.md>)   | `pending`     | 05, 05a                                                                                                         |
| [07 — Delete clinics without activity](<task 07 - delete clinics without activity.md>)                  | `pending`     | 06; [Milestone 02 Task 02](<../milestone-02-clinic-management/task 02 - delete clinics.md>)                     |

## Completion criteria

- An authenticated user can select any supported period and eligible clinic,
  see their saved rows and exact totals, and create, edit, move, and delete
  activity on desktop and mobile. Reload and a second session show the same
  data. There is no fixture fallback.
- Older entries retain their rates as required. Inactive clinics remain visible
  where they have history; new activity and reassignment to them are blocked.
  Negative and zero amounts work in both modes. A date move or deletion updates
  all affected scopes on subsequent reads.
- Signed-out and other-account requests cannot read or change activity through
  the page, application actions, or Data API. Clinic access from Milestone 03
  still works.
- An owner can delete their own clinic without saved activity after
  confirmation. Clinics linked to activity in any month cannot be deleted;
  their historical rows and totals remain intact.
- Tasks receive the checks, independent review, and human acceptance required
  by the [development workflow](../../development-workflow.md). Validate UI
  live and capture desktop and mobile evidence. Validate database changes in
  approved hosted environments under the [Supabase guide](../../supabase.md).
  Public or production rollout is separate from acceptance in development.
