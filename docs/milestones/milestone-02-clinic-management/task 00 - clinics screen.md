# Task 00 — Build the Clinics screen with sample data

Status: `pending`

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

## Progress notes

Implementation pending assignment.
