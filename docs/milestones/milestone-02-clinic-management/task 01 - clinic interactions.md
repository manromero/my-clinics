# Task 01 — Implement clinic interactions with an in-memory data source

Status: `pending`

## Objective

Validate the complete clinic workflow before connecting a real data source.

## Scope

Define a small TypeScript contract for listing, creating, and updating clinics.
Use an update to save the active state together with any name or percentage
changes. Keep the contract independent of Supabase, with stable clinic IDs and
outcomes the form can distinguish, including duplicate names and save failures.
Wire the screen to an in-memory implementation with deterministic success and
failure cases. Durable storage and authentication belong to later tasks.

## Dependencies

- [Task 00](<task 00 - clinics screen.md>).
- [Clinic requirements](../../requirements.md#clinics) and [S02](../../screens.md#s02--clinics).

## Acceptance criteria

- Create, edit, deactivate, and reactivate update the list after a successful
  save. New clinics start active. Cancel leaves the data unchanged.
- Reject blank names and duplicate names after trimming and ignoring case.
  Editing a clinic without changing its name remains valid. Accept percentages
  from 0 to 100 inclusive with up to two decimal places, including zero.
- Show loading, empty, all-inactive, and load-failure states. A failed load can
  be retried. Validation appears beside the affected field. Saving prevents
  duplicate submissions, success is visible, and a failed save retains the form
  values for retry.

## Validation

Follow the [milestone validation](readme.md#delivery-and-validation). Test the
contract, boundary values, duplicate handling, and save and cancel behavior.
Verify the interactive success and retry paths in the running screen.

## Progress notes

Implementation pending assignment.
