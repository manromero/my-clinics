# Milestone 02 — Clinic management

The user approved the original plan on 2026-11-06 and the remaining-task
restructuring on 2026-11-07. Tasks start only when assigned by the user.
Completed Tasks 00–02 retain their original scope, evidence and delivery records.

## Objective

Deliver persistent clinic management on desktop and mobile and establish dedicated
database validation credentials. [Milestone 03](../milestone-03-authentication/readme.md)
covers sign-in and owner-only access before real data or public use.

## Scope

- Persist listing, creation, editing, deactivation and reactivation of clinics.
- Provide explicit save/cancel, field validation, visible success and recoverable
  loading/saving failures that retain inputs and allow retry.
- Defer persistent deletion in the app until eligibility can be enforced against
  real activity references. Do not create an activity schema to support deletion
  in this milestone.
- Establish reproducible hosted Supabase development, declarative schemas, reviewed
  migrations, synthetic seeds, validation in scripts/CI and generated database types.
- Follow up with dedicated local/CI validation credentials and documented rotation
  in Task 09.
- Use typed Supabase Data API access from Next.js server code. Use the hosted
  synthetic development exception for Tasks 06–08. Milestone 03 Task 03
  replaces its anonymous access.
- Reuse [Milestone 01](../milestone-01-shared-components/readme.md) components and
  follow [S02](../../screens.md#s02--clinics),
  the [visual references](../../screens.md#visual-design-references),
  [architecture](../../architecture.md) and
  [clinic requirements](../../requirements.md#clinics).
- Activity UI, monthly reports, IRPF, patients and appointments are outside scope.

## Task index

| Task                                                                                                        | Status    | Direct dependencies |
| ----------------------------------------------------------------------------------------------------------- | --------- | ------------------- |
| [00 — Build the Clinics screen with sample data](<task 00 - clinics screen.md>)                             | `done`    | Milestone 01        |
| [01 — Implement clinic interactions with an in-memory data source](<task 01 - clinic interactions.md>)      | `done`    | 00                  |
| [02 — Validate clinic deletion with an in-memory data source](<task 02 - delete clinics.md>)                | `done`    | 01                  |
| [03 — Establish reproducible hosted Supabase foundations](<task 03 - supabase local foundations.md>)        | `done`    | 01, 02              |
| [04 — Validate migrations and generated database types](<task 04 - database validation and types.md>)       | `done`    | 03                  |
| [05 — Define and validate the clinic database model](<task 05 - clinic database model.md>)                  | `done`    | 04                  |
| [06 — List persistent clinics from Supabase](<task 06 - list persistent clinics.md>)                        | `done`    | 01, 02, 05          |
| [07 — Create persistent clinics](<task 07 - create persistent clinics.md>)                                  | `done`    | 06                  |
| [08 — Edit, deactivate and reactivate persistent clinics](<task 08 - update persistent clinics.md>)         | `done`    | 07                  |
| [09 — Configure dedicated database validation credentials](<task 09 - dedicated validation credentials.md>) | `pending` | 04                  |

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
not apply.

## Completion criteria

All tasks must complete required validation and independent review, receive human
acceptance and be merged into `develop` for the milestone to be complete. A task
status of `done` records completed agent delivery, with human acceptance and manual
merge tracked separately in task records and GitHub. This plan does not assert
that currently delivered tasks have been accepted or merged.

In the approved synthetic development environment, a clinic created on one device
can be listed, edited, deactivated and reactivated on another. Save/cancel,
validation and recoverable failure/retry work across the supported operations.
Local and CI database validation use dedicated credentials with documented
rotation. [Milestone 03 Task 03](<../milestone-03-authentication/task 03 - authorize clinic access.md>)
defines the access checks required before real data or public use.

The application defers persistent deletion until real activity references are
available. Task 02 records the earlier in-memory deletion validation. Task 06
retired that preview.

## Original planning decisions — 2026-11-07

- Split the previous pending Tasks 03/04 into database, persistence and
  authentication tasks. Authentication subsequently moved to Milestone 03.
- Pin the CLI through pnpm and use the official version-appropriate declarative
  schema intent and manually reviewed SQL migrations where CLI generation requires
  a local shadow database, with focused `supabase/AGENTS.md` guidance and a minimal root
  reference. Remote changes are a documented manual procedure, not CI automation.
- Validate infrastructure before business entities; an empty application schema
  may already produce generated types. Refresh them with the clinic model.
- Introduce the complete service/repository/Supabase/server boundary in Task 06,
  move memory previews behind it, then enable persistent operations incrementally.
  Unavailable persistent actions cannot report successful in-memory writes.
- The original plan kept the Data API disabled until authentication and
  authorization were in place. The later Data API decision below records the
  synthetic development exception.
- The user reconfirmed that persistent deletion remains deferred. Do not add a
  minimal activity relation here; preserve the completed Task 02 record verbatim.

## Original hosted development decision — 2026-11-07

The user rejected Docker and local Supabase/database runtimes. Database tasks use
hosted development and separately authorized disposable hosted validation targets,
with synthetic data only. Schemas and migrations remain in Git; remote application
is manually reviewed and target-verified, never an automatic CI deployment to the
shared development project.
CLI 3.0.0 declarative sync is local-only; use reviewed manual migration authoring
and establish remote schema/history reconciliation in Task 04. This scope adaptation
does not implement or start the later tasks.

## Validation credential follow-up — 2026-11-07

The user authorized use of the current CLI token for Task 04 and its CI secret,
then requested a follow-up to configure dedicated validation credentials.
The follow-up is pending assignment as Task 09, formerly Task 10.

## Supabase Data API decision — 2026-11-09

Task 06 queries the Supabase Data API from a Next.js Server Component. The user
authorized anonymous clinic CRUD on my-clinics solely for synthetic development.
Tasks 07 and 08 add persistent create and edit interfaces. Persistent deletion in
the delivered application still depends on activity eligibility. Milestone 03
Task 03 removes the temporary anonymous grants and policies and verifies
authenticated access before real data or use outside the development test.

## Remaining-task restructuring — 2026-11-11

The former authentication Task 09 is now [Milestone 03](../milestone-03-authentication/readme.md).
The dedicated validation credentials task moves from Task 10 to Task 09 with its
existing scope.
