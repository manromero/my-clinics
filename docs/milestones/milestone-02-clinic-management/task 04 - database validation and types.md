# Task 04 — Validate migrations and generated database types

Status: `pending`

## Objective

Detect unreproducible schema changes and stale TypeScript types locally and in CI
before business tables are introduced.

## Scope

Add pnpm scripts and CI validation for clean migration replay, agreement between
declarative schema and migration history, database tests, and generated TypeScript
type freshness. Use the CLI version established by Task 03. Commit generated
`Database` types even if the application schema is still empty; do not invent
business tables just to exercise the tooling.

Include an upgrade check that starts with an earlier migration baseline containing
synthetic data, applies subsequent migrations without a reset, and verifies retained
data and expected changes. A disposable test-only schema/fixture can demonstrate
this infrastructure without adding a production business entity. Document how
future tasks extend that check with their actual schema and data.

Keep all execution local or in disposable CI environments, using synthetic data.
No remote schema changes, authentication or UI integration belong here.

## Dependencies

- [Task 03](<task 03 - supabase local foundations.md>).

## Acceptance criteria

- Documented pnpm scripts and CI replay the committed migrations into a clean
  database and fail on migration errors or unexplained declarative/history drift.
- Types are generated deterministically from the replayed local schema; validation
  fails when the committed types differ, without silently rewriting them to pass.
- An upgrade scenario proves that a subsequent migration preserves existing
  synthetic data; a clean reset alone is insufficient evidence.
- The checks demonstrate failures for deliberate migration/schema/type drift and
  recover after those temporary changes are removed.
- No business entity is introduced solely for validation. Database instructions
  explain how to run checks and update reviewed migrations and generated types.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation). Run clean replay,
parity, database tests, type generation/freshness and upgrade checks locally and
record the CI result for the delivered head. Record negative-control failures and
cleanup. Distinguish unavailable CI/runtime checks from successful checks. Visual
review does not apply.

## References

- [Declarative database schemas](https://supabase.com/docs/guides/local-development/declarative-database-schemas)
- [Database migrations](https://supabase.com/docs/guides/local-development/database-migrations)
- [Database testing](https://supabase.com/docs/guides/database/testing)
- [Generating TypeScript types](https://supabase.com/docs/guides/api/rest/generating-types)

## Progress notes

Implementation pending assignment. Planning decision recorded on 2026-11-07;
this task definition does not start implementation.
