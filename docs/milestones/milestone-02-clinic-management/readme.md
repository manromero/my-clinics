# Milestone 02 — Clinic management

The user approved the plan on 2026-11-06. Tasks start only when assigned by the
user.

## Objective

Deliver the Clinics screen so Ana can sign in with her authorized Google account
and manage the same saved clinics on desktop and mobile. Start with a visual
prototype, validate the interactions against an in-memory implementation, then
connect the same workflow to Supabase.

## Scope

- List active and inactive clinics. Create clinics and edit their name, default
  percentage, and active state.
- Validate deletion of clinics without linked activity using in-memory fixtures.
  Persistent deletion is deferred until the rule can be enforced against real
  activity records.
- Provide explicit save and cancel actions, field validation, and recoverable
  loading and saving failures.
- Reuse the shared components from [Milestone 01](../milestone-01-shared-components/readme.md).
  Follow [S02 — Clinics](../../screens.md#s02--clinics), the supplied visual
  references, and the [confirmed clinic requirements](../../requirements.md#clinics).
- Include the sign-in, sign-out, and authorization needed to use Clinics.
  Activity, monthly summaries, and IRPF settings are outside this milestone.

## Task index

| Task                                                                                                    | Status        | Direct dependencies |
| ------------------------------------------------------------------------------------------------------- | ------------- | ------------------- |
| [00 — Build the Clinics screen with sample data](<task 00 - clinics screen.md>)                         | `done`        | Milestone 01        |
| [01 — Implement clinic interactions with an in-memory data source](<task 01 - clinic interactions.md>)  | `done`        | 00                  |
| [02 — Validate clinic deletion with an in-memory data source](<task 02 - delete clinics.md>)            | `in_progress` | 01                  |
| [03 — Set up Supabase and define the clinic database contract](<task 03 - supabase clinic contract.md>) | `pending`     | 01, 02              |
| [04 — Connect Clinics to Supabase](<task 04 - connect clinics.md>)                                      | `pending`     | 01, 03              |

## Delivery and validation

Follow the [development workflow](../../development-workflow.md) for each assigned
task, including independent review and delivery through a PR to `develop`.
Run `pnpm lint`, `pnpm typecheck`, and `pnpm format:check` for application changes,
and `pnpm build` when the production build is affected. Run the behavioral tests
specified by each task. For UI changes, verify the running screen on desktop and
mobile and attach visual evidence to the PR.

## Completion criteria

All five tasks are complete and merged into `develop`. Ana can create a clinic on
one device, sign in on another device and find it, then edit or deactivate it and
see the saved result after reload. Inactive clinics remain visible and can be
reactivated. An unauthenticated session and a different Google account are denied
access to both the Clinics screen and its data operations.

In the in-memory preview, Ana can confirm deletion of a clinic with no linked
activity. A clinic with linked activity remains available for deactivation.
