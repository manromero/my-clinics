# Task 07 — Create persistent clinics

Status: `pending`

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

## Progress notes

Implementation pending assignment. Planning decision recorded on 2026-11-07;
this task definition does not start implementation.
