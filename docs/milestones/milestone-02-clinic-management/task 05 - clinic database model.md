# Task 05 — Define and validate the clinic database model

Status: `done`

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

## Assignment decisions — 2026-11-08

The user clarified that stored names need not exclude surrounding whitespace;
uniqueness is the priority. The model accepts that whitespace and ignores it
when comparing names, retaining the approved case-insensitive uniqueness and
nonblank rules. No trimmed-storage constraint is required.

At the user's request, the coordinator researched primary-key options in official
[Supabase guidance](https://supabase.com/docs/guides/database/tables) and
[PostgreSQL identity documentation](https://www.postgresql.org/docs/current/ddl-identity-columns.html).
The coordinator selected `bigint generated always as identity` for this single
database rather than random UUIDs. This is a routine technical choice within the
stable-identity criterion. Future repository integration must preserve exact
integer identity when mapping to the existing string contract; generated numeric
types alone do not protect against unsafe JavaScript integer transport.

## Initial implementation — 2026-11-08

[PR #41](https://github.com/manromero/my-clinics/pull/41) contains the declarative
model, reviewed first migration, reproducible synthetic seeds, SQL boundaries,
concurrent conflict tests, actual migration upgrade preservation, generated types,
and documented database error identifiers. Implementation head:
`8e1c2ebe95adafd621b5d78a21c66bb2b03c4398`.

The implementer reports passing lint, typecheck, formatting, tooling tests (4),
and existing clinic tests (28). Hosted type generation passed in
[run 42492797764](https://github.com/manromero/my-clinics/actions/runs/42492797764).
Full validation passed at the implementation head in
[run 42493002735](https://github.com/manromero/my-clinics/actions/runs/42493002735):
clean replay, schema/history parity, seed repeatability, type freshness, SQL
boundaries, three lock-observed concurrent conflicts, actual migration upgrade
preserving synthetic data, and negative controls. All owned disposable projects
were deleted and verified absent; the shared development project was excluded.

Production build and visual capture do not apply because runtime application
code and production configuration are unchanged. Hosted validation used the
existing CI secret without extracting local CLI credentials. Independent review
is pending; task/index remain `in_progress`. Correction rounds used: 0 of 2.

## Independent review and agent completion — 2026-11-08

The independent reviewer inspected base
`23dafd061bf727fe411f28c291214dfadc40a84a` through head
`15d688afb561562cf8a04da7f28fb360bf60f949`, including implementation and tracking.
Code and functional review found no blocking or optional findings. All acceptance
criteria are covered. The reviewer independently passed lint, typecheck,
formatting, tooling tests (4), existing clinic tests (28), diff whitespace and
32 local Markdown link targets across six changed documents.

The reviewer inspected actual type-generation and full hosted-validation logs,
including numeric/constraint negative controls, concurrency lock evidence,
upgrade preservation, parity, freshness and disposable cleanup. Tracking-head
[CI run 42493548508](https://github.com/manromero/my-clinics/actions/runs/42493548508)
also passed. Hosted SQL was independently assessed through CI evidence rather
than repeated remote execution; no credentials were extracted. Visual review
and production build do not apply to this database-only change.

Task/index are `done` for agent delivery in
[PR #41](https://github.com/manromero/my-clinics/pull/41). Final focused review
and exact-head CI evidence for the completion-tracking commit are retained in
the PR before handoff. Human acceptance and manual merge remain pending.
Correction rounds used: 0 of 2. No unresolved blockers or optional findings.
