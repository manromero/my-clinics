# Task 04 — Validate migrations and generated database types

Status: `done`

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

## Implementation and initial review — 2026-11-07

Draft [PR #40](https://github.com/manromero/my-clinics/pull/40) delivers validation
scripts, hosted CI, generated types, catalog reconciliation, SQL assertions,
synthetic upgrade fixtures and operating guidance. Initial reviewed head:
`a7d6381087461842651dc581a835eb124685067f`.

The implementer reports successful exact-head hosted replay, parity, deterministic
type freshness, SQL tests, preserved-data upgrade and migration/schema/type
negative controls. Disposable targets were deleted; the reviewer independently
confirmed final target absence. Independent lint, typecheck, formatting, tooling
tests (2/2), diff and documentation link checks passed. Production build and
visual review do not apply to this tooling-only change.

Initial review is blocked: R1, hosted CI failed before remote operations because
the Actions token secret is absent; R2, physical column positions can falsely
report drift after a dropped column; R3, type ownership and domain collation are
missing from supported catalog reconciliation. Detailed evidence is preserved in
the PR. Full local hosted execution was not independently rerun during initial
review. Task remains `in_progress`.

The user explicitly authorized reading the current CLI token for this task.
Automatic approval review separately rejected sending it to GitHub Actions
without authorization naming the exact external destination. A question covering
secret `SUPABASE_ACCESS_TOKEN` in `manromero/my-clinics` remains pending; no upload
retry is authorized until that response. The shared project was not mutated.

Correction round 1 is assigned for R2/R3 and affected validation; R1 remains an
external authorization prerequisite. Correction rounds used: 1 of 2.

## Correction round 1 review — 2026-11-07

Reviewed head: `3d848e5d379920be4729c53c6d23fe7c0fdc994b`. R2 and R3 are fixed
and independently verified. Surviving columns use logical order; enum/domain
owners and domain collations are included. Hosted regressions prove equivalent
schemas pass and isolated order/type/owner/collation differences fail. The reviewer
verified the complete saved exact-head execution log and independently confirmed
disposable target cleanup. Detailed evidence is in the
[PR review record](https://github.com/manromero/my-clinics/pull/40#issuecomment-6711030634).

Independent lint, typecheck, formatting, tooling tests (2/2), committed diff and
31 documentation links passed again. Current-head tooling CI passed. No new
blocking findings or optional suggestions remain beyond R1. The full hosted
lifecycle was verified from saved evidence rather than independently repeated.

Delivery remains blocked and PR #40 stays draft: R1 requires a successful hosted
CI run on the delivered head after explicit authorization to send the current
Supabase CLI token to GitHub Actions secret `SUPABASE_ACCESS_TOKEN` in repository
`manromero/my-clinics`, or after the user configures that secret. That question is
pending; the prior automatic approval rejection has not been bypassed. No second
correction round is needed for code at this point. Task/index remain
`in_progress`; human acceptance and manual merge are pending. Correction rounds
used: 1 of 2. [Task 09](<task 09 - dedicated validation credentials.md>) records
dedicated credentials as future work.

## User-configured CI credential — 2026-11-08

The user configured `SUPABASE_ACCESS_TOKEN` directly in GitHub Actions. Only the
secret name was checked; no CLI credential extraction or token upload occurred.
This resolves the previous missing-secret prerequisite and supersedes the pending
request to upload the personal CLI token.

[Hosted CI run 42470527981](https://github.com/manromero/my-clinics/actions/runs/42470527981)
at `3fe4e5d996c30f0cea0cc62ed4ff02350e342a29` passed tooling checks but failed
the initial organization lookup with HTTP 403. No project was created and no
cleanup was needed. The scoped token needs `Organization Settings` Read
(`organization_admin_read`) and access to organization `njnmfutclorywskqrftd`;
the response alone does not distinguish a missing permission from an excluded
organization. The user has been asked to verify both and update the GitHub secret
if necessary. R1 remains open; task/index stay `in_progress`, PR stays draft.
No code changes or additional correction rounds were made; count remains 1 of 2.

## Completed validation and independent review — 2026-11-08

The user corrected the dedicated GitHub secret's organization scope.
[CI run 42490668690](https://github.com/manromero/my-clinics/actions/runs/42490668690)
passed both tooling and hosted jobs at reviewed head
`25369032b9b4426ab1b81ce0025c9ea1e7b969a6`. The reviewer independently inspected
the exact head, jobs and complete execution logs and closed R1. R2/R3 remain fixed;
no blocking or optional findings remain. Earlier blocked records above are
historical and superseded by this successful verification.

Acceptance coverage includes clean replay, deterministic generated types and
freshness, SQL tests, existing-data upgrade preservation, migration/schema/type
negative controls and recovery, catalog regressions and declarative/history
parity. Tooling tests (2/2), lint, typecheck and formatting passed in CI. Both
disposable targets were deleted and absence verified; the shared development
project was not mutated. Review verified CI evidence rather than repeating the
hosted lifecycle or independently querying Supabase. UI review and production
build do not apply.

Task and milestone index are `done` for agent delivery through
[PR #40](https://github.com/manromero/my-clinics/pull/40). Final tracking changes
receive focused review and final-head CI verification before handoff. Human
acceptance and manual merge remain pending. Correction rounds used: 1 of 2.
Task 09 remains pending and covers the remaining credential configuration and
rotation follow-up; this CI setup does not claim that whole task is complete.
