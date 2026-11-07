# Task 05 — Define and validate the clinic database model

Status: `pending`

## Objective

Enforce the approved clinic data rules in PostgreSQL independently of the UI.

## Scope

Add the clinic declarative schema, reviewed migration, synthetic seeds, database
tests and refreshed generated types. Define stable IDs, clinic names, exact default
percentages and an active state that defaults to active. Preserve the semantics of
the existing in-memory contract when mapping database outcomes in later tasks.

Definitive authorization, Google identity, RLS and database permissions are deferred
to the final security task, not abandoned. Use only an isolated local environment
with fake data; this task does not authorize remote or public use. UI integration,
activity features and persistent clinic deletion are outside this task.

## Dependencies

- [Task 04](<task 04 - database validation and types.md>).
- [Clinic requirements](../../requirements.md#clinics).

## Acceptance criteria

- Each clinic has a stable identity, a nonblank name, an exact percentage and
  active/inactive state. Omitted active state creates an active clinic.
- Names are unique after trimming surrounding spaces and ignoring case. The
  database rejects concurrent conflicting inserts or updates, while an unchanged
  name on the same clinic remains valid.
- Percentages accept 0 and 100 inclusive and at most two decimal places. Invalid
  precision or range is rejected before coercion can silently round it into a
  valid value; direct database writes are covered as well as later app validation.
- Synthetic seeds contain active/inactive and boundary examples and are
  reproducible. Schema/history parity, clean replay and generated types pass.
- An upgrade from the previous baseline retains existing synthetic data.
  Document constraint/error identifiers for later domain mapping.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation). Run Task 04 checks
and meaningful database tests for blank names, normalization, unchanged-name edits,
concurrent conflicts, percentage bounds and excess precision, and active defaults.
Verify invalid writes cannot be accepted by implicit numeric rounding. Run upgrade
validation with existing synthetic data. No UI capture is required.

## Progress boundary

The model is a local foundation only. Passing these checks is not evidence of
Ana-only access or permission to use real data before the final security gate.

## Progress notes

Implementation pending assignment. Planning decision recorded on 2026-11-07;
this task definition does not start implementation.
