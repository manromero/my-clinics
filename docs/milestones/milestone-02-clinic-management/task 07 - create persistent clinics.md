# Task 07 — Create persistent clinics

Status: `in_progress`

## Objective

Save new clinics in Supabase with recoverable errors.

## Scope

Add a create form and connect it to the Supabase Data API through Next.js server
code. Use the [hosted synthetic development exception](../../supabase.md#synthetic-development-rollout).
Editing, state changes, deletion and the final authentication/security gate
belong to later tasks.

## Dependencies

- [Task 06](<task 06 - list persistent clinics.md>).
- [Clinic requirements](../../requirements.md#clinics) and
  [saving requirements](../../requirements.md#saving-and-date-defaults).

## Acceptance criteria

- Explicit Save creates a clinic with a stable ID and active default; the list
  updates from successful persistence and reload retains it. Cancel writes nothing.
- Blank/duplicate names and invalid percentage range or precision produce useful
  Spanish field errors. Database duplicate conflicts, including concurrent
  creates, map to the name field.
- Saving prevents repeated submission. A failure retains entered values, displays
  feedback and permits retry; success is visible only after database success.
- Create uses the typed Supabase client from Task 06 on the server. Unsupported
  persistent edit, state-change and delete actions remain unavailable.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation). Test create
behavior, validation boundaries, concurrent duplicate conflicts, cancellation,
failure and retry against hosted development Supabase. Run database/type checks
as applicable. Exercise create/save/cancel/error/retry and reload
on desktop and mobile; compare S02 and capture evidence. Run application checks and
production build. No real data or public deployment is authorized.

## Execution context

- Ready for implementation. Task 06 was merged in
  [PR #42](https://github.com/manromero/my-clinics/pull/42). Branch
  `feature/create-persistent-clinics` starts at
  `81fd77d6d59d31d0ef24282aef2d525889dc4f84` on `develop`.
- [Architecture](../../architecture.md) and [S02](../../screens.md#s02--clinics)
  guide route-local composition and the use of shared components. The current
  `src/app/clinics` route streams the saved list, which reads through
  `src/lib/supabase/server-client.ts` and preserves bigint IDs as text.
- The existing schema supplies the active default and generated ID. The
  `clinics_name_key_unique` index is authoritative for duplicate names under
  concurrency. Reuse the existing percentage parser and verify the server
  validation path independently of browser controls.
- The configured URL matches the approved synthetic development project.
  Hosted checks must use identifiable synthetic fixtures, preserve existing
  rows, and verify cleanup of their own fixtures. Verify live behavior at
  desktop and mobile viewports and publish evidence through the project skills.
- Expected implementation path is application-only, subject to validation of
  the existing Data API grants and defaults. No open product decisions.

## Progress notes

[PR #43](https://github.com/manromero/my-clinics/pull/43) delivers the shared
create dialog and typed server action. The dialog displays the database's
initial active state and refreshes the saved list after a successful insert.

Independent review passed implementation commit
`e6924662ec80fc3db3787a3e069ea446fc10e440`. Lint, typecheck, formatting, the
production build, 216 application tests, four database tooling tests, and the
diff check passed. The schema and generated types did not change.

Hosted checks verified cancellation, Spanish validation, duplicate prevention
while saving, recovery after an injected save failure, and persistence after
reload on desktop and touch-emulated mobile. Concurrent name variants produced
one saved row and one name error. The temporary fixtures were removed and the
original synthetic rows were unchanged. The reviewer compared both viewports
with Alexandria and S02 and independently inspected all six PR attachments.

There were no blockers and zero correction rounds were used. Human acceptance
and manual merge remain pending in GitHub.

## User-requested follow-up — 2026-11-10

Reopen [PR #43](https://github.com/manromero/my-clinics/pull/43) at
`c78fa4888195c9576958ccf764829126d1665846` on the same feature branch and base.
The user approved both optional changes and a 200-character clinic name limit.

- Clear the error for the field being edited, leaving other field errors in
  place and keeping focus on the edited field. Update the umbrella milestones
  summary to match the task status.
- Limit entry to 200 characters, including pasted text, and show the current
  count in Spanish. Validate the limit in the server action and PostgreSQL as
  well. Use Unicode code points consistently with PostgreSQL `char_length`.
- Verify the 200/201 boundary and non-ASCII names in the application and SQL.
  Keep existing valid rows intact on upgrade and surface the database limit as
  a name error. Repeat the affected desktop and mobile form checks and publish
  updated inline evidence.
- Validate the forward migration, schema parity, upgrade preservation and
  generated type freshness through the authorized disposable hosted CI workflow.
  The shared development schema is outside that validation target.
