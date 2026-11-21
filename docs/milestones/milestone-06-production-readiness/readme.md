# Milestone 06 — Production readiness

## Objective

Prepare the existing MyClinics screens for everyday use: open the right screen
on entry, make repeated activity entry easier, and keep the app steady when
moving between screens or returning to the browser tab.

## Scope

- **Entry and navigation:** send visitors from the root to sign-in, restrict the
  component catalogue to development mode, and order the existing navigation
  links **Clínicas → Actividad → Resumen**. Activity opens after sign-in.
- **Activity entry:** when reopening the create modal during the same Activity
  visit, preselect the clinic used in the last successful creation. Keep the
  existing date behavior.
- **Performance:** investigate and fix each reported issue within its own
  implementation task. Keep the shared interface stable on navigation, make
  session checks and history restoration less disruptive, and improve how
  destination content loads. Define session continuity, bounded cache reuse,
  background revalidation, and invalidation before adding destination prefetch.

This milestone prepares the application for production. It does not include
production deployment, release tagging, new business features, or changes to
saved financial calculations.

## Delivery sequence

| Task                                                                                                                 | Status    | Direct dependencies                             |
| -------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------- |
| [00 — Set up entry routing and a development-only catalogue](<task 00 - entry routing and development catalogue.md>) | `done`    | Existing sign-in flow and catalogue             |
| [01 — Reorder the signed-in navigation](<task 01 - reorder signed-in navigation.md>)                                 | `done`    | Existing Activity, Clinics, and Summary screens |
| [02 — Reuse the last clinic in new activities](<task 02 - reuse the last clinic.md>)                                 | `done`    | Existing activity creation and date default     |
| [03 — Keep the interface visible during navigation](<task 03 - stabilize signed-in navigation.md>)                   | `done`    | 01                                              |
| [04 — Improve session continuity and history restoration](<task 04 - improve session checks on tab return.md>)       | `done`    | 03                                              |
| [05 — Improve destination loading with prefetch](<task 05 - improve destination loading.md>)                         | `pending` | 03 and 04                                       |

Tasks 00–02 can be assigned independently once their existing dependencies are
available on `develop`. Tasks 03–05 build on one another so each can measure and
verify its own change against the latest signed-in navigation behavior.

## Completion criteria

- All six tasks meet their acceptance criteria and follow the
  [standard development workflow](../../development-workflow.md) and
  [Git workflow](../../git-workflow.md).
- Validate browser behavior on desktop and mobile, including a production
  build for routing and performance. Use the
  [signed-in synthetic validation procedure](../../supabase.md#local-signed-in-validation)
  for protected screens.
- Each performance task records a reproducible scenario, the findings from
  its investigation, the fix, and comparable evidence before and after.
  Protected data stays private and fresh enough for the existing workflows.

## Progress notes

The user approved this scope and delivery sequence on 2026-11-15.
Implementation will be assigned separately.

On 2026-11-20, the user expanded Task 04 to cover session continuity, conditional
history restoration, bounded caching, background revalidation, and invalidation.
Task 05 will consume that policy when implementing destination prefetch.
