# Hosted Supabase development

## Boundary and baseline

Use hosted development projects with synthetic data only. No Docker, local
Supabase stack or local database is part of this workflow. The CLI runs on the
workstation; the database and Studio run at Supabase. Task 03 adds no business
tables, auth setup, app integration or real data. The desired `public` application
schema, migration history and seed are empty. Supabase's own schemas/extensions
are platform-managed and are not an application baseline to erase.

Keep the hosted **Data API disabled** until Task 09 verifies authentication,
Ana-only access, RLS and permissions. Disabling it does not restrict SQL credentials
or replace that security gate. Do not deploy the persistent application publicly.
Tasks 06–08 must resolve a server-only hosted connection compatible with this
restriction when assigned; this task does not choose their implementation.

## 1. Create the account and development project

1. Open the [Supabase Dashboard](https://supabase.com/dashboard), sign in or create
   an account, and create/select your development organization.
2. Choose **New project**, select that organization, name the project
   `myclinics-dev`, and choose an appropriate EU region. Check the displayed plan
   and costs before accepting paid options.
3. Generate a strong database password and save it in your password manager.
   Enter it only in Supabase or your local credential prompt, never chat or Git.
4. Disable **Enable Data API** during creation if offered. Otherwise, before
   adding any application objects, open **Integrations > Data API**, disable
   **Enable Data API**, and save. Verify it remains disabled. Also disable
   automatic exposure of new tables if that setting is available. See
   [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api).
5. Wait until the project is ready. In project settings, record the project name,
   project ID/ref, organization and region. The ref also appears in its Dashboard
   URL. These identifiers are not passwords. Confirm this is development and
   contains no existing business/real data before any later write.
6. Use hosted Table Editor/SQL Editor as Studio; no localhost Studio is needed.
   Do not create tables manually. Run `check.sql` in SQL Editor for an initial
   read-only baseline inspection. Save only redacted results and identifiers.

An existing project containing data is not an empty baseline. Stop and plan an
explicit migration/adoption path; do not reset it to fit these instructions.

## 2. Reproduce workstation tooling

Use Node.js 24 and pnpm 11.25.0 from `package.json`:

```powershell
pnpm install --frozen-lockfile
pnpm supabase --version
pnpm supabase db query --help
pnpm supabase db push --help
```

The committed dependency pins Supabase CLI **3.0.0**. On 2026-11-07 its actual help
uses `--remote=<ref>`; older CLI reference examples using `--linked` or `--db-url`
do not match this binary. Recheck help before upgrading. `supabase init` was used
only to establish the repository config; do not run it again over this checkout.
`config.toml` declares schema/seed paths and safe tooling defaults. It does **not**
turn off the hosted Data API; verify that separately in the Dashboard.

Authenticate interactively on your own workstation:

```powershell
pnpm supabase login
$developmentRef = Read-Host 'Verified development project ref (20 lowercase letters)'
```

Compare the ref with the Dashboard settings, name and organization yourself.
Never paste an access token, password, connection URL or API key into chat. Prefer
interactive login/OS credential storage. `supabase/.env.example` contains only
optional blank metadata; copying it is not required and does not select a target.
CLI credentials in `SUPABASE_ACCESS_TOKEN` / `SUPABASE_DB_PASSWORD`, if needed,
belong in a temporary local shell session or a secret manager, not committed files.
No application environment variables or Supabase API keys are needed for Task 03.
Never place secrets in `NEXT_PUBLIC_*` or Next.js `env` config (both can be bundled).

## 3. Verify connectivity without writes

After verifying the project ref and authenticating locally:

```powershell
pnpm supabase db query --remote=$developmentRef --read-only --file supabase/check.sql
```

This uses a read-only transaction and reports server version and `public` table
metadata, not business records. The project ref selects the target; the returned
`current_database()` name alone cannot prove identity (hosted projects commonly
share a database name). Match the requested ref to Dashboard settings before
running it. Confirm Data API is disabled in Dashboard and inspect baseline objects.
Record command, CLI/server versions, ref/name, date and redacted result. A successful
CLI help command or Dashboard login does not prove database connectivity.

Record actual results separately for each target. Until these steps are executed,
connectivity, hosted Studio access, Data API configuration and baseline inspection
are unverified. There is no automated linking or remote write script here.

## 4. Schema and reviewed migrations

The locations and ownership rules are in [AGENTS.md](AGENTS.md). Edit desired SQL
in `schemas/` first, then create a migration file on disk:

```powershell
pnpm supabase migration new describe_change
```

Author its SQL manually and review it alongside the desired schema. Do not run the
schema definition files directly against an existing database. Migrations describe
incremental changes and data preservation; desired definitions describe the end
state. No no-op migration is needed for the current empty application baseline.
The seed is comment-only and disabled; it must not be applied remotely by default.

CLI 3.0.0 `db schema declarative sync --help` reports **Local only**, needs a shadow
database, and offers no remote/shadow URL flag. `--no-apply` prevents application
but does not make generation remote-only. We therefore **do not use automatic
declarative generation** under the user's no-local-database decision. A disposable
remote database alone does not make that command supported. `db diff`, `db pull`,
`db dump` or reset must not be presumed Docker-free just because they target remote.
Do not run them as a workaround. See the official
[declarative guide](https://supabase.com/docs/guides/local-development/declarative-database-schemas)
and use actual pinned CLI help where the web reference differs.

Task 04 will implement and validate a remote-only method for declarative/history
reconciliation, clean replay, existing-data upgrades, tests and type freshness on
explicitly authorized disposable hosted databases/branches. Those checks do not
exist yet and are not claimed as passing. Manual authoring does not remove parity
or review requirements. Any new remote generation tool needs a separate verified
technical choice; no unsupported shadow-database procedure is promised here.

## 5. Manual migration application (future authorized writes)

This procedure documents future work; Task 03 does not authorize remote mutation.

1. Obtain approval for the exact project ref, migration set/commit and intended
   changes. Verify name/ref/organization/environment in Dashboard. Ensure Data API
   remains disabled during pre-security development. Confirm only synthetic data.
2. Review every pending SQL file, destructive effects, data preservation, seed and
   schema agreement. Complete Task 04 validation on an authorized disposable hosted
   target before applying business migrations. Arrange an appropriate backup and
   recovery plan before a change that can destroy data. Use a reviewed forward fix
   for recovery; do not edit applied migrations or reset the development project.
3. In an authenticated local terminal, explicitly set/verify `$developmentRef` as
   above. Inspect history and the proposed changes, without applying migrations:

   ```powershell
   pnpm supabase migration list --remote=$developmentRef
   pnpm supabase db push --remote=$developmentRef --dry-run --skip-vault
   ```

   `--dry-run` is a migration preview, not a general guarantee that all CLI remote
   interactions are read-only; the connectivity step uses `db query --read-only`.
   `--skip-vault` avoids unrelated vault synchronization. Stop for unexpected
   history, SQL, target or drift; do not add `--include-all` or repair history.

4. After reviewing that exact preview and confirming write authorization, apply:

   ```powershell
   pnpm supabase db push --remote=$developmentRef --skip-vault
   ```

   Read the hosted confirmation and verify its target again. Do not pass `--yes`,
   include seeds/roles, push config, or run remote reset as part of this procedure.

5. Recheck history, `check.sql`, and task-specific invariants/tests; record the head,
   target, actual result and failures. Refresh generated types via Task 04's
   validated method when applicable. Do not report successful persistence on error.

## Recovery from a clean clone

Install the frozen dependencies again, authenticate locally, re-enter and verify
the same hosted development ref, then run the read-only inspection. There is no
local start/stop/reset lifecycle and no uncommitted Studio schema to recover.
Use Git migrations plus the hosted history to diagnose divergence. Clean replay
and repeated baseline reproduction require separately authorized disposable hosted
projects/branches in Task 04, never resetting the shared development project.

## Validation recorded at delivery

CLI version/help and file-only migration creation can be checked without database
access. Hosted checks require a verified target and local authentication. Record
each check as passing, failed or unavailable; do not infer Dashboard API settings
from SQL connectivity. Exact delivered-head results are recorded in the PR.
There are no UI changes, so desktop/mobile screenshots do not apply.

If your trusted organization CA is installed in the OS certificate store but the
CLI reports a TLS/transport error, use `$env:NODE_USE_SYSTEM_CA='1'` in that terminal
and retry. This adds system certificate trust without disabling TLS verification;
see [Bun certificate support](https://bun.sh/docs/runtime/environment-variables).
