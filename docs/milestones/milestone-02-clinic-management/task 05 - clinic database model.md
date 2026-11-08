# Task 05 — Define and validate the clinic database model

Status: `in_progress`

## Objective

Enforce the approved clinic data rules in PostgreSQL independently of the UI.

## Scope

Add the clinic declarative schema, reviewed migration, synthetic seeds, database
tests and refreshed generated types. Define stable IDs, clinic names, exact default
percentages and an active state that defaults to active. Preserve the semantics of
the existing in-memory contract when mapping database outcomes in later tasks.

Definitive authorization, Google identity, RLS and database permissions are deferred
to the final security task, not abandoned. Use only the verified hosted development environment
with fake data and Data API disabled; remote writes require explicit target review
and authorization. This task does not authorize public use. UI integration,
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

The model is a hosted development foundation only. Passing these checks is not evidence of
Ana-only access or permission to use real data before the final security gate.

## Progress notes

Assigned by the user on 2026-11-08 following the project workflow. The user
explicitly authorized Free disposable `myclinics-validation-*` projects in
organization `njnmfutclorywskqrftd`, synthetic migration/seed/test writes with
Data API disabled, cleanup, and CI using the existing repository secret.
Shared development `lvqbrjybwstvdhaxyxyn` is excluded from remote writes.

## Execution context

- Readiness: approved scope and criteria; dependency Task 04 merged through
  PR #40. Clean checkout, remote access and pnpm 11.25.0 verified. Native
  implementer and reviewer roles are available in the active session.
- Branch: `feature/clinic-database-model`; base:
  `23dafd061bf727fe411f28c291214dfadc40a84a` (updated `origin/develop`).
- Sources: this task, milestone index, clinic requirements, architecture,
  screens, development and Git workflows, `supabase/AGENTS.md`, and
  `docs/supabase.md`. Consult official PostgreSQL documentation for numeric
  coercion, normalization and concurrent uniqueness details.
- Relevant assets: `supabase/schemas/`, `supabase/migrations/`,
  `supabase/seed.sql`, `supabase/tests/`, `supabase/validation/`,
  `scripts/database-validation.mjs`, its tests and CI workflow,
  `src/lib/supabase/database.types.ts`, and the existing clinic source contract
  in `src/app/clinics/`.
- Verified findings: the previous application schema/migration baseline is
  empty. Current upgrade coverage is an infrastructure fixture only; this task
  must also exercise the actual new migration from its previous baseline while
  preserving existing synthetic data. SQL assertions currently execute in
  rolled-back transactions; concurrent uniqueness needs independent sessions.
  Generated types must come from the hosted replay, never manual edits.
- Constraints: no Docker/local database, real data, shared-development writes,
  authentication/RLS implementation, UI integration, activity entities or
  persistent deletion. Preserve applied migration history. One writer at a time.
- Validation: lint, typecheck, formatting, tooling tests, hosted clean replay,
  schema/history parity, seeds, database boundary and concurrency assertions,
  actual migration upgrade preservation, deterministic generated type freshness,
  negative controls, and delivered-head CI. Assess production build impact;
  no UI capture applies. Record actual results and disposable cleanup.
- Open product questions: none. Local credential availability is unverified;
  the existing authorized CI secret is available for hosted validation. Do not
  extract stored CLI credentials without separate authorization.
- Correction rounds used: 0 of 2.
