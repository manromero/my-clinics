# Task 07 — Create persistent clinics

Status: `pending`

## Objective

Save new clinics through the established service boundary with recoverable errors.

## Scope

Extend the repository contract, Supabase implementation, service and server entry
point with create, then connect the existing create form. Preserve synthetic preview
support behind the same service. Use local fake data only. Editing, state changes,
deletion and the final authentication/security gate belong to later tasks.

## Dependencies

- [Task 06](<task 06 - list persistent clinics.md>).
- [Clinic requirements](../../requirements.md#clinics) and
  [saving requirements](../../requirements.md#saving-and-date-defaults).

## Acceptance criteria

- Explicit Save creates a clinic with a stable ID and active default; the list
  updates from successful persistence and reload retains it. Cancel writes nothing.
- Blank/duplicate names and invalid percentage range or precision produce useful
  Spanish field errors. Database duplicate conflicts, including concurrent
  creates, map through the service to the name field.
- Saving prevents repeated submission. A failure retains entered values, displays
  feedback and permits retry; success is visible only after database success.
- UI and server entry points retain the Task 06 service boundary. Unsupported
  persistent edit, state-change and delete actions remain unavailable.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation). Test service and
repository create behavior, validation boundaries, concurrent duplicate conflicts,
cancellation, failure and retry against local Supabase. Run database/type checks and
existing previews as applicable. Exercise create/save/cancel/error/retry and reload
on desktop and mobile; compare S02 and capture evidence. Run application checks and
production build. No real data or public deployment is authorized.

## Progress notes

Implementation pending assignment. Planning decision recorded on 2026-11-07;
this task definition does not start implementation.
