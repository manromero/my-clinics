# Hosted Supabase development

Run all commands from the repository root. File paths below are repository-relative.
For automated work, also follow the complementary
[database agent rules](../supabase/AGENTS.md).

## Development boundary

Use hosted development projects with synthetic data only. No Docker, local
Supabase stack or local database is part of this workflow. The CLI runs on the
workstation; the database and Studio run at Supabase. Desired schemas, migrations,
synthetic seeds and tests live in `supabase/`. Supabase's own schemas/extensions
are platform-managed; do not erase them to reproduce the application schema.

Keep the hosted **Data API disabled** until authentication, owner-only access,
RLS and permissions have been verified. The user authorized a scoped
[synthetic development exception](#synthetic-development-rollout) for
`lvqbrjybwstvdhaxyxyn`. Do not deploy the persistent application publicly.
Application connections must respect this restriction; integration does not
authorize enabling the API or bypassing the security prerequisite.

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
   Do not create tables manually. Run `supabase/check.sql` in SQL Editor for an initial
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

The committed dependency pins Supabase CLI **3.0.0**. Its help
uses `--remote=<ref>`; older CLI reference examples using `--linked` or `--db-url`
do not match this binary. Recheck help before upgrading. Do not run `supabase init`
over the existing repository configuration.
`supabase/config.toml` declares schema/seed paths and safe tooling defaults. It does **not**
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
Database validation credentials are separate from application configuration.
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

Record actual results separately for each target in the task/PR. CLI help or login
alone does not verify connectivity, project identity or hosted API configuration.

## 4. Schema and reviewed migrations

Edit desired SQL in `supabase/schemas/` first, then create a reviewed incremental
migration in `supabase/migrations/` on disk:

```powershell
pnpm supabase migration new describe_change
```

Author its SQL manually and review it alongside the desired schema. Do not run the
schema definition files directly against an existing database. Migrations describe
incremental changes and data preservation; desired definitions describe the end
state. `supabase/seed.sql` contains deterministic synthetic clinic examples;
automatic seeding remains disabled and it must not be applied remotely by
default. Database tests live in `supabase/tests/`; generated types live at
`src/lib/supabase/database.types.ts`.

CLI 3.0.0 `db schema declarative sync --help` reports **Local only**, needs a shadow
database, and offers no remote/shadow URL flag. `--no-apply` prevents application
but does not make generation remote-only. We therefore **do not use automatic
declarative generation** in this hosted-only workflow. A disposable
remote database alone does not make that command supported. `db diff`, `db pull`,
`db dump` or reset must not be presumed Docker-free just because they target remote.
Do not run them as a workaround. See the official
[declarative guide](https://supabase.com/docs/guides/local-development/declarative-database-schemas)
and use actual pinned CLI help where the web reference differs.

The remote validation procedure below reconciles declarative SQL and migration
history without a local runtime. Manual authoring does not remove parity or review
requirements. No unsupported shadow-database procedure is used.

## 4a. Disposable hosted validation and generated types

Use Node 24, the frozen pnpm dependencies and CLI 3.0.0. These commands create,
write and delete disposable projects in the explicitly authorized organization
`njnmfutclorywskqrftd`. They never link, reset or deploy to shared development
`lvqbrjybwstvdhaxyxyn`. Obtain authorization for this lifecycle before running it.
Only the Free organization plan is accepted; no paid upgrade is performed. One
free project slot is required. The runner checks capacity in the validation
organization. Supabase applies the [full Free plan quota](https://supabase.com/docs/guides/platform/billing-on-supabase#free-plan)
when creating a project, including usage across organizations. Resolve capacity
errors with the organization owner. Existing projects are never removed for capacity.

### Validation token and permissions

Use a dedicated scoped personal access token (PAT) from [Supabase Access Tokens](https://supabase.com/dashboard/account/tokens).
Select **all projects in selected organizations**, select only `njnmfutclorywskqrftd`,
and start with **No access**. Grant the following access and set an expiry suited
to the validation window. The token owner's current Supabase role must also allow
these operations. See the [Supabase permission scopes](https://supabase.com/docs/guides/platform/personal-access-tokens#permission-scopes).

| Permission            | Access     | Management API operations                                                                                                                             |
| --------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization Settings | Read       | `GET /v1/organizations/{slug}` verifies the Free plan.                                                                                                |
| Organization Projects | Read-write | `GET /v1/organizations/{slug}/projects` checks capacity and confirms cleanup. `POST /v1/projects` creates a project in the selected organization.     |
| Project Settings      | Read-write | `GET /v1/projects/{ref}` verifies identity and readiness. `DELETE /v1/projects/{ref}` removes the verified disposable project.                        |
| Data API Config       | Read-write | `PATCH` and `GET /v1/projects/{ref}/postgrest` disable and verify the Data API.                                                                       |
| Database              | Read-write | `POST /v1/projects/{ref}/database/query` runs SQL including writes. The pinned CLI calls `GET /v1/projects/{ref}/types/typescript` to generate types. |

The runner uses the organization-specific inventory, so **Projects (account-wide)**
can stay disabled. Leave other permissions disabled, including Data API JWT Secret,
API Keys and Migrations. Validation replays migrations as SQL.

New disposable projects need access as soon as they are created. Supabase offers
fixed project selections or all projects in selected organizations. The organization
selection also reaches the shared development project under the granted permissions.
Supabase cannot scope the token to the `myclinics-validation-` name prefix or to
projects created by one invocation. The runner enforces that boundary by checking
identity, rejecting the shared ref and targeting only projects created by the
current process.

For local use, copy [validation.env.example](../supabase/validation.env.example)
to the ignored repository-root `.env.database-validation` and enter the token under
`SUPABASE_ACCESS_TOKEN`. Alternatively provide the token in a temporary shell used
only for validation. Shell values take precedence over the file. Set
`MYCLINICS_DISPOSABLE_AUTHORIZATION=njnmfutclorywskqrftd` after the disposable lifecycle
is authorized. Keep the token out of Git, logs and Next.js configuration and
environment files. CI supplies its dedicated PAT through the repository Actions
secret `SUPABASE_ACCESS_TOKEN`. The runner requires the scoped `sbp_fc` format and
passes the same value explicitly to the pinned CLI for type generation. Manual
`supabase login` remains a separate workflow.

```powershell
pnpm db:test-tooling
pnpm db:types
pnpm db:validate
```

`db:types` creates a fresh hosted replay target, executes committed migrations in
lexical order, generates `public` TypeScript types twice using the pinned CLI,
and checks deterministic output. It deletes that project before creating a second
fresh project for declarative SQL. Catalog agreement must pass before writing
`src/lib/supabase/database.types.ts`. Prettier normalizes generated formatting only;
types are never hand-authored. `db:validate` compares generation with the committed
file without rewriting it and additionally runs database tests, upgrade and
negative controls. SQL errors and assertion failures exit nonzero.

The Management API creates the targets with random, unlogged database passwords.
The runner verifies ref/name/organization and healthy status, then sets the Data
API's `db_schema` to the empty disabled value. It rechecks disabled state before
every SQL operation, including fixtures. The pinned CLI recognizes empty schema
configuration as Data API disabled. No application object is written before that
verification. The finalizer verifies identity again, deletes only the project
created by that process and checks its absence. If a process is killed or cleanup
fails, use its printed ref/name to inspect the organization and manually remove
only that disposable project before rerunning; never delete shared development.

Replay executes each reviewed migration and its standard
`supabase_migrations.schema_migrations` record in one transaction via the hosted
SQL Management API. This validates SQL/history reproduction rather than invoking
interactive `db push` or silently repairing history. Migrations must support
transactional execution; explicitly review operations requiring another execution
model before adopting them. Declarative SQL runs only on its own fresh target.
The targets are sequential so the existing project plus one free slot suffices.

[catalog.sql](../supabase/validation/catalog.sql) compares sorted semantic `public`
metadata: relations, columns/defaults, constraints, indexes, views, sequences,
triggers, routines, enum/domain types, policies, ownership and grants. It excludes
OID identities and platform extension-owned objects. No SQL-text equality, local
shadow database, Docker, diff or dump is involved. The supported application scope
is `public`; extend the catalog and its validation before adding other schemas or
object kinds (for example aggregates, custom operators, partitioning or standalone
composite types). Known unsupported namespace object kinds fail closed. An
unrepresented object must never be accepted as proven parity; review the catalog
coverage with every new schema feature. Comments and physical storage tuning are
outside this semantic comparison and still require SQL review.

Database assertions live in `supabase/tests/*.sql`, run in sorted order inside
rolled-back transactions, and must raise exceptions on failure. Concurrent clinic
uniqueness is checked through independent sessions, with lock observation before
asserting one committed winner. Synthetic seeds are applied twice to verify
repeatability. Regression controls must detect limited-scale numeric rounding
and missing constraints or indexes.

Upgrade validation applies the actual clinic migration to its previous baseline
with committed synthetic data in a separate test-only schema, verifies preservation
without reset and compares the result with clean replay. The infrastructure fixture
in `supabase/validation/upgrade/` also checks the upgrade mechanism. Schema changes
require their own earlier baseline and preservation assertions; the infrastructure
fixture alone does not prove application migrations safe. Test-only fixtures are
removed after validation.

Negative controls execute invalid migration SQL, introduce an extra `public` table
and deliberately change the expected type content. The same replay/parity/freshness
assertions must reject them. The table is removed and parity rechecked; invalid
SQL leaves no object and type drift stays in memory. All targets are then deleted.

Catalog regressions check logical column order, type ownership and collation
without relying on project-specific OIDs. Fixture cleanup must restore full
baseline parity.

The [database workflow](../.github/workflows/database-validation.yml) runs offline
tooling checks for PRs to `develop`. Its hosted job runs only by explicit
`workflow_dispatch` on the reviewed assignment branch, using GitHub Actions secret
`SUPABASE_ACCESS_TOKEN`. This prevents untrusted PRs from receiving credentials or
automatically creating projects. The hosted run includes replay, parity, database
tests, deterministic type freshness, upgrade and negative controls. Concurrency
serializes hosted runs without cancelling cleanup. There is no shared-development
deployment automation. Record the actual run URL and exact head in the PR; a
passing tooling-only PR run is not evidence that hosted validation ran.

For environments without an authorized local token, explicitly dispatch `mode:
types` on the assignment branch. This runs `pnpm db:types` with the existing CI
secret and uploads only `src/lib/supabase/database.types.ts` as
`hosted-database-types`. Retrieve that artifact, inspect and commit the generated
file, then dispatch `mode: validate` on the resulting head. The types artifact is
not evidence of committed-type freshness; the subsequent validation run provides
that check. No token extraction or automatic commit is involved.

### Renew or recover a validation token

1. Before expiry, review the token's organization, permissions and expiry in
   [Supabase Access Tokens](https://supabase.com/dashboard/account/tokens). Generate
   a replacement with the scope above and store its value in the approved secret
   manager when Supabase displays it. A token's scope and permissions are fixed
   at creation.
2. Supply the replacement locally. With disposable lifecycle authorization, run
   `pnpm db:validate` and confirm the run deletes its targets before proceeding.
3. Update the existing `SUPABASE_ACCESS_TOKEN` repository secret in GitHub Settings
   under **Secrets and variables > Actions**. Dispatch the database workflow in
   `validate` mode on the approved branch and confirm successful hosted validation
   and cleanup. Keep the prior dedicated token available until the replacement has
   passed both checks. If CI fails and the prior dedicated token is still valid,
   restore it from the approved secret manager while diagnosing the failure.
4. Delete the retired validation token by its name in Supabase Access Tokens once
   the replacement is verified. Leave the token for interactive CLI login in place.

For HTTP 401, check for an expired, revoked or incorrectly copied token and check
whether a shell value overrides the file. For HTTP 403, review organization scope,
the operation's permission and the owner's current role. Replace an unusable token
through the steps above. If a token is exposed, revoke that validation token
immediately, then replace the affected local and CI values. Use the logged ref and
name to verify and clean up any stranded disposable project before retrying.

## 5. Manual migration application

The procedure itself does not authorize remote writes.

1. Obtain approval for the exact project ref, migration set/commit and intended
   changes. Verify name/ref/organization/environment in Dashboard. Ensure Data API
   remains disabled during migration. Confirm only synthetic data. Use the scoped
   development rollout below for any separately authorized enablement.
2. Review every pending SQL file, destructive effects, data preservation, seed and
   schema agreement. Complete database validation on an authorized disposable hosted
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

5. Recheck history, `supabase/check.sql`, and task-specific invariants/tests; record the head,
   target, actual result and failures in the task/PR. Refresh generated types with
   `pnpm db:types` when applicable. Do not report successful persistence on error.

## Recovery from a clean clone

Install the frozen dependencies again, authenticate locally, re-enter and verify
the same hosted development ref, then run the read-only inspection. There is no
local start/stop/reset lifecycle and no uncommitted Studio schema to recover.
Use Git migrations plus the hosted history to diagnose divergence. Clean replay
and repeated baseline reproduction require separately authorized disposable hosted
projects, never resetting the shared development project.

## Validation recorded at delivery

CLI version/help and file-only migration creation can be checked without database
access. Hosted checks require a verified target and local authentication. Record
each check as passing, failed or unavailable; do not infer Dashboard API settings
from SQL connectivity. Exact delivered-head results are recorded in the PR.
Database-only validation does not require desktop/mobile screenshots.

If your trusted organization CA is installed in the OS certificate store but the
CLI reports a TLS/transport error, use `$env:NODE_USE_SYSTEM_CA='1'` in that terminal
and retry. This adds system certificate trust without disabling TLS verification;
see [Bun certificate support](https://bun.sh/docs/runtime/environment-variables).

## Google OAuth for hosted development

Use the Google Cloud project `myclinics-dev` and verify the hosted Supabase
project ref is `lvqbrjybwstvdhaxyxyn` before editing Authentication settings.
Local development and the protected Vercel Preview use this hosted Auth service.

1. In Google Auth Platform, set the audience to **External** and leave the app
   in **Testing**. Add the accounts intended for Task 02 under **Test users**.
   Use the basic sign-in scopes. Google permits users outside the test list when
   the app requests only basic identity scopes. [Google OAuth app states](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview)
2. Under **Clients**, create an OAuth client of type **Web application**. Set
   **Authorized JavaScript origins** to `http://localhost:3000` and
   **Authorized redirect URIs** to
   `https://lvqbrjybwstvdhaxyxyn.supabase.co/auth/v1/callback`. Check the URI
   against the callback shown in the Supabase Google provider panel. [Supabase Google sign-in setup](https://supabase.com/docs/guides/auth/social-sign-in/auth-google#project-setup)
3. In Supabase **Authentication > Sign In / Providers > Google**, enable the
   provider and enter the web client's ID and secret directly in the provider
   settings. Save. Keep both values out of Git, application configuration and
   validation evidence.
4. In Supabase **Authentication > URL Configuration**, set **Site URL** to
   `http://localhost:3000` and add `http://localhost:3000/auth/callback` as an
   exact entry under **Redirect URLs**. Save and reopen the page to verify both
   fields. [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

The Google client sends users back to the hosted Supabase callback.
[Milestone 03 Task 02](<milestones/milestone-03-authentication/task 02 - supabase sign-in.md>)
exchanges the returned code at the application's `/auth/callback`.

### Vercel sign-in origins

- **Local development.** Open `http://localhost:3000/login` and keep
  `http://localhost:3000/auth/callback` in the development Supabase **Redirect
  URLs**.
- **Preview.** Enable Vercel system environment variables. The app uses
  `VERCEL_BRANCH_URL` when `VERCEL_ENV=preview`. Set the Preview Supabase URL
  and publishable key for the hosted development project. Add
  `https://my-clinics-git-*-manromeros-projects.vercel.app/auth/callback` to that
  project's **Redirect URLs**. Keep the Preview protected by Vercel
  authentication and use synthetic clinic data. Open `/login` on the stable
  branch URL after authenticating with Vercel.
  [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)
- **Production.** After the
  [Milestone 03 security gate](<milestones/milestone-03-authentication/task 03 - authorize clinic access.md>),
  set the Production Supabase URL and publishable key for the approved
  production project. Set the server-side Production `APP_ORIGIN` and the
  production Supabase **Site URL** to `https://my-clinics.vercel.app`. Add
  `https://my-clinics.vercel.app/auth/callback` under **Redirect URLs** in the
  approved production Supabase project. Complete any Google verification that
  applies, publish the production OAuth app through **Audience**, and verify
  sign-in with a Google account outside the test list.
  [Google OAuth app states](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview)

Redeploy after changing Vercel environment values.
[Vercel environment variables](https://vercel.com/docs/environment-variables)

Start and finish OAuth on the canonical application origin so the browser can
send the PKCE verifier cookie back to the application callback. Submitting
the login form from another deployment alias opens the configured canonical
login page before creating the verifier. The Google web client's **Authorized
redirect URI** is still the corresponding Supabase provider callback
(`https://<project-ref>.supabase.co/auth/v1/callback`). The Vercel
`/auth/callback` URLs belong in the Supabase allowlists.
[Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

## Persistent clinic listing

`/clinics` lists saved clinics through the Supabase Data API in a Next.js
Server Component. It follows the [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs#7-query-supabase-data-from-nextjs)
query pattern. PostgreSQL grants and row-level security (RLS) govern Data API
requests. The screen lists clinics and offers retry.

Copy the [root template](../.env.example) to an ignored root `.env.local` if
it does not exist. Set `NEXT_PUBLIC_SUPABASE_URL` to the approved development
project URL and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to its
`sb_publishable_` key. Supply the same variables to Next.js on an approved
host when public deployment is authorized. Keep Management API tokens,
database passwords and Supabase secret keys in trusted operator settings.

### Synthetic development rollout

The user authorized anonymous access on `my-clinics` (`lvqbrjybwstvdhaxyxyn`)
while it holds synthetic clinics. Anyone with the project's publishable key
can read and change those rows through the API. Keep this project synthetic
until [Milestone 03 Task 03](<milestones/milestone-03-authentication/task 03 - authorize clinic access.md>)
replaces the development policies with owner-only access. Task
06 exposes only listing and retry in the app. The temporary database grants
also support synthetic insert, update and deletion requests.

1. Verify the target name and ref, the Data API disabled setting, and that
   `public.clinics` is the only public table with exactly the approved three
   synthetic rows. Review the exact migration preview and apply it through the
   [manual migration procedure](#5-manual-migration-application). Check migration
   history and verify the three rows are preserved.
2. Confirm RLS is enabled. The `anon` role can select and delete clinic rows and
   insert or update `name`, `percentage` and `active`. PostgreSQL generates IDs.
   The name constraint needs execute access to its pure normalization helper.
   Direct sequence access, ID writes, truncate and clinic access for other app
   roles are excluded by the grants. Verify the disposable SQL results before
   enabling the Data API on the named shared target.
3. Enable the Data API for the public schema on that target and keep automatic
   exposure of new tables disabled. Verify direct REST listing with the
   publishable key and confirm the local Server Component displays the three
   synthetic rows.
   Verify access limitations with the SQL role tests and record actual HTTP
   results separately. Leave existing synthetic rows untouched during rollout
   verification unless a separate probe mutation is authorized.
4. Disable the Data API before introducing real data or widening access beyond
   this synthetic exception. Milestone 03 Task 03 owns the authenticated policy, access
   verification and public-use gate.

### Validation evidence

Authorized `pnpm db:validate` uses disposable projects with the Data API
still disabled. It verifies replay, schema parity, committed type freshness,
upgrade preservation, and anonymous CRUD and privilege limits under real SQL
roles. The application unit tests verify the SDK request and row mapping with
controlled HTTP responses. Live REST and local browser checks on the approved
shared project verify the running Server Component.
