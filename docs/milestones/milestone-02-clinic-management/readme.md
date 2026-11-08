# Milestone 02 — Clinic management

The user approved the original plan on 2026-11-06 and the remaining-task
restructuring on 2026-11-07. Tasks start only when assigned by the user.
Completed Tasks 00–02 retain their original scope, evidence and delivery records.

## Objective

Deliver Clinics so Ana can sign in with her authorized Google account and manage
the same saved clinics on desktop and mobile. Build on the completed visual and
in-memory workflow with small, separately verifiable database and persistence tasks,
then complete authentication and authorization as the final release gate.

## Scope

- Persist listing, creation, editing, deactivation and reactivation of clinics.
- Provide explicit save/cancel, field validation, visible success and recoverable
  loading/saving failures that retain inputs and allow retry.
- Keep deletion in the separate in-memory preview only. Persistent deletion stays
  deferred until eligibility can be enforced against real activity references.
  Do not create an activity schema to support deletion in this milestone.
- Establish reproducible hosted Supabase development, declarative schemas, reviewed
  migrations, synthetic seeds, validation in scripts/CI and generated database types.
- Follow up with dedicated local/CI validation credentials and documented rotation
  in Task 10, without replacing Task 09's application security gate.
- Require a service layer, repository contract, in-memory and Supabase repository
  implementations, typed client and server entry points. UI and server entry points
  call the service, never repositories directly; do not add a new framework.
- Complete Google sign-in/sign-out, Ana-only authorization, database RLS and
  permissions for every persistent operation before real data or public use.
- Reuse [Milestone 01](../milestone-01-shared-components/readme.md) components and
  follow [S02](../../screens.md#s02--clinics), [S01](../../screens.md#s01--sign-in),
  the [visual references](../../screens.md#visual-design-references),
  [architecture](../../architecture.md) and
  [clinic requirements](../../requirements.md#clinics).
- Activity UI, monthly reports, IRPF, patients and appointments are outside scope.

## Task index

| Task                                                                                                                | Status    | Direct dependencies |
| ------------------------------------------------------------------------------------------------------------------- | --------- | ------------------- |
| [00 — Build the Clinics screen with sample data](<task 00 - clinics screen.md>)                                     | `done`    | Milestone 01        |
| [01 — Implement clinic interactions with an in-memory data source](<task 01 - clinic interactions.md>)              | `done`    | 00                  |
| [02 — Validate clinic deletion with an in-memory data source](<task 02 - delete clinics.md>)                        | `done`    | 01                  |
| [03 — Establish reproducible hosted Supabase foundations](<task 03 - supabase local foundations.md>)                | `done`    | 01, 02              |
| [04 — Validate migrations and generated database types](<task 04 - database validation and types.md>)               | `done`    | 03                  |
| [05 — Define and validate the clinic database model](<task 05 - clinic database model.md>)                          | `done`    | 04                  |
| [06 — List persistent clinics through the service boundary](<task 06 - list persistent clinics.md>)                 | `in_progress` | 01, 02, 05          |
| [07 — Create persistent clinics](<task 07 - create persistent clinics.md>)                                          | `pending` | 06                  |
| [08 — Edit, deactivate and reactivate persistent clinics](<task 08 - update persistent clinics.md>)                 | `pending` | 07                  |
| [09 — Secure persistent Clinics with Google authentication](<task 09 - clinic authentication and authorization.md>) | `pending` | 08                  |
| [10 — Configure dedicated database validation credentials](<task 10 - dedicated validation credentials.md>)         | `pending` | 04                  |

## Delivery and validation

Follow the [development workflow](../../development-workflow.md) for each assigned
task, including independent review and a PR to `develop`. For documentation-only
changes, check formatting and links. Run `pnpm lint`, `pnpm typecheck` and
`pnpm format:check` for application changes, `pnpm build` when the production build
is affected, and the task's behavioral/database tests. Record exact commands,
versions, delivered head and results; distinguish failed, unavailable and unperformed
checks. Database changes must maintain declarative/history parity, clean replay,
existing-data upgrades and generated type freshness after Task 04 establishes them.

For UI changes, verify live desktop/mobile interactions against Alexandria and the
applicable Stitch reference, use `chrome-screenshots` for visual evidence and
`github-pr` for PR publication. Infrastructure tasks explain why UI evidence does
not apply. Missing infrastructure or Google credentials prevents claiming the
corresponding validation passed.

## Completion criteria

All tasks must complete required validation and independent review, receive human
acceptance and be merged into `develop` for the milestone to be complete. A task
status of `done` records completed agent delivery, with human acceptance and manual
merge tracked separately in task records and GitHub. This plan does not assert
that currently delivered tasks have been accepted or merged.

Ana can create a clinic on one device, find it on another, edit or deactivate it,
and see the saved result after reload and sign-in again. Inactive clinics remain
visible and can be reactivated. Save/cancel, validation and recoverable failure/retry
work across every supported persistent operation. Unauthenticated users and other
Google accounts cannot access the screen or data through direct requests or the
database API. Final access tests cover all persistent reads and writes, RLS,
permissions, sign-out and desktop/mobile behavior.

In-memory deletion keeps its completed behavior: confirm deletion of a clinic with
no linked activity and offer deactivation when activity exists. The persistent
screen and data permissions do not allow deletion before real activity references
are available in a later scope.

## Decisions — 2026-11-07

- Split the previous pending Tasks 03/04 into Tasks 03–09 above. This is planning
  only; implementation of every new task remains pending assignment.
- Pin the CLI through pnpm and use the official version-appropriate declarative
  schema intent and manually reviewed SQL migrations where CLI generation requires
  a local shadow database, with focused `supabase/AGENTS.md` guidance and a minimal root
  reference. Remote changes are a documented manual procedure, not CI automation.
- Validate infrastructure before business entities; an empty application schema
  may already produce generated types. Refresh them with the clinic model.
- Introduce the complete service/repository/Supabase/server boundary in Task 06,
  move memory previews behind it, then enable persistent operations incrementally.
  Unavailable persistent actions cannot report successful in-memory writes.
- Use only hosted development synthetic data before Task 09, with Data API disabled. Google authentication, authorization,
  RLS and permissions are deferred, not abandoned; they are mandatory before real
  data or public use.
- The user reconfirmed that persistent deletion remains deferred. Do not add a
  minimal activity relation here; preserve the completed Task 02 record verbatim.

## Hosted development decision - 2026-11-07

The user rejected Docker and local Supabase/database runtimes. Tasks 03-09 use
hosted development and separately authorized disposable hosted validation targets,
with synthetic data only. Schemas and migrations remain in Git; remote application
is manually reviewed and target-verified, never an automatic CI deployment to the
shared development project. Keep Data API disabled before Task 09's security gate.
CLI 3.0.0 declarative sync is local-only; use reviewed manual migration authoring
and establish remote schema/history reconciliation in Task 04. This scope adaptation
does not implement or start the later tasks.

## Validation credential follow-up — 2026-11-07

The user authorized use of the current CLI token for Task 04 and its CI secret,
then requested Task 10 at the end of this milestone to configure dedicated
validation credentials later. Task 10 is pending assignment; it does not delay
Task 04 or authorize extracting credentials in future sessions without approval.

