# Task 01 — Implement clinic interactions with an in-memory data source

Status: `in_progress`

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

## Execution context

- Ready. Task 00 was merged in PR #36. Branch `feature/clinic-interactions`
  starts from `develop` at `1ed8254f30776eb44bac1187105d9f9b831f7d1d`.
- `src/app/clinics/page.tsx` selects the sample data and supports
  `/clinics?preview=empty`. Its client component currently presents the list and
  form with a placeholder submit handler. Reuse the shared components and keep
  clinic-specific code close to the route.
- Follow the clinic requirements, S02, Alexandria, and the Stitch export.
  Use synthetic scenarios to exercise empty and all-inactive data and recoverable
  load and save failures. Verify the scenarios through the running screen and
  record how to reproduce them in the PR.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build`, and
  `pnpm test`. Capture desktop and mobile evidence and attach it to the PR
  targeting `develop`. GitHub access and the merged prerequisite were verified.
- No open product decisions. Correction rounds used: 0.

## Progress notes

Implementation started on the prepared feature branch.
