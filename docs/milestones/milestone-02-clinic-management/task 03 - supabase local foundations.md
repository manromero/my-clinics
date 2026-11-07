# Task 03 — Establish reproducible hosted Supabase foundations

Status: `done`

## Objective

Make hosted database development reproducible before introducing business entities
or connecting Clinics, without Docker or a local database runtime.

## Scope

Pin the Supabase CLI as a pnpm-managed development dependency and commit its
lockfile resolution. Configure repository schema, migration and synthetic seed
locations. Document hosted account/project setup, safe environment metadata,
interactive authentication, explicit-target read-only connectivity and recovery
from a clean clone. Keep the hosted Data API disabled before the final security gate.

Create `supabase/AGENTS.md` and a minimal root reference. Preserve desired schema
and reviewed migration history in Git. Verify the pinned CLI help against official
documentation. If automatic declarative generation requires a local shadow database,
record that limitation and author reviewed SQL migrations manually; do not promise
an unsupported remote shadow option. Task 04 establishes remote-only parity checks.

Document a manual remote migration procedure with target verification, SQL review,
preview and explicit write authorization. No remote mutation is performed here.
Do not add business tables, authentication integration, app integration or real data.
All pre-security data is synthetic in hosted development; public/production use
remains prohibited before Task 09.

## Dependencies

- [Task 01](<task 01 - clinic interactions.md>) and
  [Task 02](<task 02 - delete clinics.md>).
- [Architecture](../../architecture.md) and
  [development workflow](../../development-workflow.md).

## Acceptance criteria

- A clean clone installs the pinned CLI with frozen dependencies; hosted project
  setup and read-only connectivity are documented and verified when access exists.
- Desired schemas, reviewed migration history, synthetic seed and future test/type
  locations are explicit and version-controlled; no business tables are required.
- Hosted development baseline and Studio access are inspected without mutation.
  Missing access is reported as unavailable rather than a successful runtime check.
- Secrets and generated artifacts are ignored; safe examples distinguish metadata
  from CLI/server-only credentials and explain that no app keys are needed yet.
- Database instructions describe the schema/migration review workflow and CLI
  shadow-runtime limitation. The manual write procedure verifies the exact target
  and destructive effects; it performs no remote changes in this task.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation). Record Node,
pnpm and CLI versions, frozen installation, CLI help/config and file-only migration
checks, formatting, links, and secret/artifact inspection. Record actual hosted
read-only connectivity, Studio/API setting and baseline results when access exists.
Clean replay, repeated baseline reproduction, parity and upgrades belong to Task 04
on authorized disposable hosted targets. Unavailable hosted checks block a ready
result. UI evidence is unnecessary for infrastructure work.

## References

- [Declarative database schemas](https://supabase.com/docs/guides/local-development/declarative-database-schemas)
- [Supabase CLI and local development](https://supabase.com/docs/guides/local-development)
- [Database migrations](https://supabase.com/docs/guides/local-development/database-migrations)

## Progress notes

Delivered on 2026-11-07 in [PR #39](https://github.com/manromero/my-clinics/pull/39).
Required checks and independent review passed at implementation head
`316fc0cac12d56e85343376d49bea055d7e0aabc`, with no blocking findings and zero
correction rounds. Final tracking changes receive a focused documentation review.
Human acceptance and manual merge remain pending.

Optional review observation R-OPT1: committed-range `git diff --check` reports
CRLF-related whitespace on final lines in four Supabase scaffolding files.
This does not block acceptance; the implementation's clean working-tree diff
check does not establish a clean committed-range diff check. Detailed evidence
and review limitations are preserved in the PR.

## Execution context

- Approved scope adaptation, 2026-11-07: the user rejected all Docker/local
  Supabase use and approved hosted development with synthetic data, Git-managed
  schemas and manually reviewed migrations. Related Tasks 04-09 are amended only
  for consistency; they are not assigned for implementation.
- Branch: `feature/supabase-local-foundations` (original name retained).
- Base: `98721e4f6930115b2d6ff8eab1041ca245578e2e` (`develop`).
- Sources: task/milestone, requirements, architecture, development workflow,
  official Supabase docs and actual CLI 3.0.0 help. Web reference flags differ
  from installed CLI: use verified `--remote=<ref>`, not legacy examples.
- Tooling: Node 24.14.0, pnpm 11.25.0, Supabase CLI 3.0.0.
- Confirmed target: `lvqbrjybwstvdhaxyxyn`; user confirms new empty hosted
  development project. Credentials must be entered locally, never in chat.
- CLI declarative sync is local-only. Manual reviewed migration authoring is the
  remote-only route; Task 04 must implement reconciliation and remote validation.
- Remote mutation, real data, business entities, auth/app integration are excluded.
- Hosted verification: authenticated read-only query passed on 2026-11-07 against
  `my-clinics` (`lvqbrjybwstvdhaxyxyn`), PostgreSQL 17.11, role
  `supabase_read_only_user`, with no `public` tables/views. CLI labels its platform
  environment `production`; the user designated this new empty project for
  development. No remote mutations were executed.
- User confirmed Dashboard access and Data API disabled. This is user-provided
  configuration evidence; the agent did not independently inspect that setting.
- Checks passed: frozen dependency install, CLI version/help, file-only migration
  creation/cleanup, lint, typecheck, format, local documentation links and ignored
  secret/runtime paths. Production build is not affected; no UI capture applies.
- Initial registry/query certificate failures resolved with system CA trust
  (`NODE_USE_SYSTEM_CA=1`), without bypassing TLS verification.
- Independent review repeated frozen install, lint, typecheck, formatting, local
  link/secret checks, file-only migration creation/cleanup and hosted read-only
  baseline inspection successfully. No application/UI changes require build or
  visual capture. Dashboard/Data API state remains user-confirmed evidence.
- Correction rounds used: 0. Final tracking review and human acceptance are
  recorded separately; no remote writes were performed.
