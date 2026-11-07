# Task 04 — Validate migrations and generated database types

Status: `in_progress`

## Objective

Detect unreproducible schema changes and stale TypeScript types on disposable hosted targets and in CI
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

Use separately authorized disposable hosted databases/branches with synthetic data
for replay, parity, upgrade and CI checks. No Docker/local database runtime or
shared-development deployment automation is allowed. Target creation, replay and
cleanup writes require explicit target authorization. Authentication/app integration
belong to later tasks. Define a remote-only schema/history reconciliation method;
CLI declarative sync cannot use a remote shadow target in the pinned version.

## Dependencies

- [Task 03](<task 03 - supabase local foundations.md>).

## Acceptance criteria

- Documented pnpm scripts and CI replay the committed migrations into a clean
  database and fail on migration errors or unexplained declarative/history drift.
- Types are generated deterministically from the replayed hosted validation schema; validation
  fails when the committed types differ, without silently rewriting them to pass.
- An upgrade scenario proves that a subsequent migration preserves existing
  synthetic data; a clean reset alone is insufficient evidence.
- The checks demonstrate failures for deliberate migration/schema/type drift and
  recover after those temporary changes are removed.
- No business entity is introduced solely for validation. Database instructions
  explain how to run checks and update reviewed migrations and generated types.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation). Run clean replay,
parity, database tests, type generation/freshness and upgrade checks on authorized disposable hosted targets and
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

### Assignment intake — 2026-11-07

The user assigned implementation following the project workflow and explicitly
authorized disposable hosted target creation, migration/schema/fixture writes,
negative controls and cleanup. The existing shared development project is not
an authorized disposable target. The initial authorization blocker is resolved.

Preparation verified a clean checkout, GitHub authentication and remote access,
pnpm 11.25.0, and Supabase CLI 3.0.0. Remote `develop` is
`55c5c34` and includes Task 03 through PR #39. Read-only project listing exposes
only the existing `my-clinics` development project (`lvqbrjybwstvdhaxyxyn`) in
organization `njnmfutclorywskqrftd`; no disposable target has been selected.
Network/tool checks succeeded with system CA trust and approved network access.
Native implementer and reviewer roles are available in this session. No remote
database writes, application changes, CI runs, or task validation were performed.
Correction rounds used: 0.

## Execution context

- Readiness: approved scope, dependency Task 03 merged, native implementer/reviewer
  roles available, GitHub and hosted Supabase access verified. User authorized
  disposable validation operations in response to the intake question.
- Branch: `feature/database-validation-types`; base:
  `55c5c345b407a0cf9578480c2906a7f1aa69cf40` (updated `origin/develop`).
- Sources: this task, milestone index, requirements, architecture, development
  workflow, `supabase/AGENTS.md`, `docs/supabase.md`, official Supabase declarative,
  database testing and generated-types guides, and actual CLI 3.0.0 help.
- Relevant assets: `package.json`, `pnpm-lock.yaml`, `supabase/config.toml`,
  `supabase/schemas/`, `supabase/migrations/`, future `supabase/tests/`,
  `src/lib/supabase/database.types.ts`, validation scripts and GitHub Actions.
- Verified findings: CLI 3.0.0 supports explicit `--remote=<ref>` query and
  TypeScript generation; declarative sync needs a local shadow runtime and must
  not be used. Organization `njnmfutclorywskqrftd` is accessible. Disposable
  targets must be created/verified and their Data API disabled before fixture
  writes. Shared development ref `lvqbrjybwstvdhaxyxyn` must never be reset or
  used as a disposable validation target.
- Constraints: no Docker/local database, business entities, auth/app integration,
  real data, shared-development deployment automation, secret output or commits.
  Keep CLI pinned, preserve approved acceptance criteria and record target cleanup.
- Validation: lint, typecheck, formatting, relevant script tests, remote clean
  replay/parity/database tests/type freshness/upgrade, negative controls and CI
  on delivered head. Build only if production build is affected; UI review does
  not apply. Missing runtime/CI evidence prevents ready delivery.
- Technical implementation choices remain with the implementer; no product
  questions remain. Report target capacity, access or cost blockers with evidence.
- Correction rounds used: 0.
