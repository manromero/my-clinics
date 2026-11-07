# Task 03 — Establish reproducible local Supabase foundations

Status: `pending`

## Objective

Make local database development reproducible before introducing business entities
or connecting Clinics.

## Scope

Pin the Supabase CLI as a pnpm-managed development dependency and commit its
lockfile resolution. Configure the local project, declarative schema directory,
migration history and synthetic seed workflow. Document prerequisites, environment
variables, local start/stop/reset, Studio access, and recovery from a clean clone.
Use the official declarative-schema workflow for the pinned version; verify
commands against its documentation rather than copying legacy CLI commands.

Create `supabase/AGENTS.md` for database-specific instructions and add only a
minimal reference from root `AGENTS.md`. Define where declarative definitions,
generated/reviewed migrations, seeds, tests and generated types belong, how they
stay synchronized, and how agents distinguish local resets from remote changes.
Document a manual remote migration procedure with target verification and review;
do not automate or execute remote changes in this task.

Do not add clinic tables, authentication, application integration or real data.
All pre-security work is restricted to local development with synthetic data;
there is no public or production use before the final security gate.

## Dependencies

- [Task 01](<task 01 - clinic interactions.md>) and
  [Task 02](<task 02 - delete clinics.md>).
- [Architecture](../../architecture.md) and
  [development workflow](../../development-workflow.md).

## Acceptance criteria

- A clean clone can install the declared pnpm dependencies and reproduce the
  local environment using the pinned CLI and documented runtime prerequisites.
- Declarative schemas, migration history and seed configuration have explicit,
  version-controlled locations; no business scaffolding tables are required.
- Local start, Studio access, reset and stop are verified. Resetting twice
  produces the same documented baseline without depending on manual Studio edits.
- Secret values and local runtime artifacts are excluded from version control;
  safe environment examples explain which values are local and server-only.
- Database instructions describe the schema-to-migration review workflow and
  local/remote distinction. The manual remote procedure makes its target and
  potential destructive effects explicit and performs no remote mutation here.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation). Record exact CLI,
pnpm and runtime versions and actual clean-start/reset/Studio checks. Validate
setup instructions from a fresh local state and inspect tracked files for secrets
and generated runtime artifacts. Documentation formatting and links must pass.
Report unavailable prerequisites explicitly; documentation alone does not prove
that the environment runs. UI evidence is unnecessary for infrastructure work.

## References

- [Declarative database schemas](https://supabase.com/docs/guides/local-development/declarative-database-schemas)
- [Supabase CLI and local development](https://supabase.com/docs/guides/local-development)
- [Database migrations](https://supabase.com/docs/guides/local-development/database-migrations)

## Progress notes

Implementation pending assignment. Planning decision recorded on 2026-11-07;
this task definition does not start implementation.
