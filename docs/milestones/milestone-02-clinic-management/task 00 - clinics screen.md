# Task 00 — Build the Clinics screen with sample data

Status: `done`

## Objective

Review the structure and responsive presentation of Clinics before implementing
the save flow.

## Scope

Compose `/clinics` from the existing application shell and shared controls. Keep
clinic-specific components close to the route. Use a small synthetic fixture with
active and inactive clinics, and present the list, empty state, and create and
edit form layouts. Allow opening and dismissing the form for visual review.
Clinic writes, the data contract, and authentication belong to later tasks.

## Dependencies

- [Milestone 01](../milestone-01-shared-components/readme.md).
- [Architecture](../../architecture.md), [S02](../../screens.md#s02--clinics), and
  the [visual references](../../screens.md#visual-design-references).

## Acceptance criteria

- The list shows each clinic's name, default percentage, and status in Spanish.
  Both statuses and the `Nueva clínica` and `Editar` entry points are visible.
- The form shows the applicable name, percentage, and state fields, plus
  `Guardar` and `Cancelar`. Opening a create form shows the active default.
  Opening an edit form shows the selected fixture. The preview does not report a
  successful save or change the fixture.
- The empty state gives access to `Nueva clínica`. The list and form are readable
  on narrow screens, and form open and close support keyboard use.

## Validation

Follow the [milestone validation](readme.md#delivery-and-validation). Compare the
running list, empty state, and form with S02 and Alexandria on desktop and mobile.

## Execution context

- Ready. Milestone 01 is complete and integrated. The task criteria define the
  preview behavior and exclude clinic writes, a data contract, and authentication.
- Branch `feature/clinics-screen` starts from `develop` at
  `775e440aa1c9b330cb9eeeaa412d430350cd2ead`.
- Use route-local code in `src/app/clinics` and the shell and controls in
  `src/lib/components`. The root layout already sets Spanish and loads the
  Alexandria fonts. There is no existing Clinics route.
- S02 and Alexandria guide card hierarchy, state labels, percentage formatting,
  and the form. The Stitch export also contains controls beyond the approved
  task scope. Verify the populated and empty list and both form modes live,
  including keyboard open and dismissal. Capture desktop and mobile evidence
  and attach it to the PR targeting `develop`.
- GitHub CLI authentication and screenshot attachment support were verified.
  No open product decisions. Correction rounds used: 0.

## Progress notes

Delivered in [PR #36](https://github.com/manromero/my-clinics/pull/36).
Open `/clinics` for the populated preview and `/clinics?preview=empty` for the
empty state. The form uses the shared dialog. Saving from the preview leaves
the sample records intact.

Implementation and independent review passed `pnpm lint`, `pnpm typecheck`,
`pnpm format:check`, `pnpm build`, and `pnpm test` (185 tests). Independent
review of `7a12c90a3ad91447a201acb2c714c4066edec6d0` verified the list, empty
state, create and edit defaults, keyboard and focus behavior, and responsive
layout against S02 and Alexandria at 1440 × 900 and 390 × 844. The PR contains
the visual evidence. No findings and zero correction rounds.

Human approval and manual merge into `develop` are pending.
