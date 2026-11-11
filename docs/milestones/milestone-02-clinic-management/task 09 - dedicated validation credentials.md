# Task 09 — Configure dedicated database validation credentials

Status: `in_progress`

## Objective

Make local and CI database validation use explicit, dedicated credentials instead
of reusing the personal token stored by the interactive Supabase CLI.

## Scope

Review the access required by Task 04's hosted validation lifecycle and configure
a dedicated validation token with the narrowest supported permissions. Document
any platform limitation on restricting its organization, projects or operations.
Keep local CLI login available for manual work; validation scripts receive their
credential explicitly rather than extracting the CLI's stored token.

Provide a documented local configuration through environment variables or an
ignored validation-specific environment file, with a committed example containing
no secrets. Keep validation credentials separate from Next.js application settings
and client bundles. Configure the dedicated credential in GitHub Actions Secrets,
verify validation still works, and document renewal, revocation and recovery.
Replace the reused personal-token CI secret only after the replacement is verified;
do not revoke the user's personal CLI token or disrupt manual login without
explicit approval.

Update the existing Supabase guide only with current configuration, supported
permission limits and renewal/recovery steps. Keep credential transition history,
future plans and execution evidence in the task/PR rather than the operating guide.

This is operational credential configuration, not application authentication or a
new database feature. Do not change product behavior, add paid services, broaden
database targets, deploy to shared development/production, or put secrets in chat,
Git, logs or `NEXT_PUBLIC_*` variables. Hosted writes and credential operations
require explicit authorization at execution time.

## Dependencies

- [Task 04](<task 04 - database validation and types.md>) and its delivered local
  and CI validation workflow.
- Access to Supabase credential management and repository Actions Secrets.
- User-approved credential ownership, supported permissions and authorized
  disposable validation targets when this task is assigned.

## Acceptance criteria

- Local and CI validation use a dedicated credential explicitly, without reading
  the personal token stored by the interactive CLI.
- Supported permissions and target restrictions are documented and verified;
  limitations are recorded rather than claiming unsupported isolation.
- A fresh workstation can configure validation from the safe example and guide.
  Local secret files are ignored by Git and never exposed to the application.
- The dedicated GitHub Actions secret is configured and a validation run passes
  on a recorded commit using authorized disposable hosted targets.
- Missing or invalid credentials fail clearly without leaking secret values.
  Replacement, revocation and recovery instructions preserve manual CLI access.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation) and the separate
implementation/review workflow. Check documentation links, formatting, ignored
local configuration and absence of secrets from tracked files and logs. Exercise
local and CI hosted validation with the dedicated credential, missing/invalid
credential handling and the documented replacement procedure. Record actual
permissions, authorized targets, cleanup and CI/head evidence. No UI review applies.

## Progress notes

Added at the user's request on 2026-11-07 as future work at the end of Milestone 02.
Renumbered from Task 10 to Task 09 on 2026-11-11. Task 04 originally used the
then-authorized credential. At Task 09 intake, the user confirmed the existing
CI secret contains a dedicated scoped token and supplied an explicit local token.
The assignment preserves the existing secret configuration while verifying the
dedicated path. [Milestone 03](../milestone-03-authentication/readme.md) covers
application authentication and authorization.

## Execution context

- Assignment branch: `feature/dedicated-validation-credentials`, based on
  `develop` at `ff91234b8caaad089f500bc0207af11ea458d06a`.
- Task 04 is merged. Its successful [hosted run](https://github.com/manromero/my-clinics/actions/runs/42490668690)
  followed the user's configuration of an organization-scoped CI credential.
  The repository still has a `SUPABASE_ACCESS_TOKEN` secret. The user supplied a
  scoped token for local validation through the ignored configuration and
  explicitly authorized local and CI validation on disposable targets in
  `njnmfutclorywskqrftd`.
- Inspect the validation runner, database workflow, local example and Supabase
  guide together. The scoped token needs to reach projects created after
  issuance, so its organization scope includes the existing shared project.
  Keep the runner's target guard and retain the existing CI secret if the
  dedicated configuration and validation are verified. The current token's
  exact permission selections remain to be verified.
- Compare required Management API operations against the
  [Supabase permissions reference](https://supabase.com/docs/guides/platform/personal-access-tokens#permission-scopes).
  Exercise credential failure paths, valid local and CI runs, and cleanup.
  UI review does not apply. Correction rounds used: 0 of 2.

## Implementation and independent review — 2026-11-11

[Draft PR #45](https://github.com/manromero/my-clinics/pull/45) targets `develop`.
The implementation and independent review covered
`80956b3d9bcafc2538151b8ca1cedad818937bb9`. The runner requires an
explicit scoped token, passes it to the pinned CLI, and checks the inventory in
the authorized organization without needing account-wide project listing.

Local lint, typecheck, formatting, build, 236 application tests and five
database tooling tests passed. Missing and synthetic invalid credentials failed
with redacted diagnostics. The configuration is Git-ignored and tracked files
and hosted logs contained no literal token. [Hosted CI](https://github.com/manromero/my-clinics/actions/runs/42982510269)
passed with the existing repository secret and confirmed all three disposable
projects were deleted and absent. The reviewer independently verified the run
and cleanup, reran the tooling, lint, typecheck and formatting checks, and found
no code or documentation defects.

- **BLOCK-01:** The supplied local token received HTTP 401 on the initial
  read-only organization check. No local disposable project was created. A
  successful local run with a working dedicated token and cleanup evidence is
  pending.
- **BLOCK-02:** The required permission mapping and effective CI access are
  verified. The token owner's confirmation or redacted Dashboard evidence of
  the exact grants and organization scope is pending. No live credential
  rotation or revocation was performed.

The task remains `in_progress`. Correction rounds used: 0 of 2. Human approval
and manual merge remain pending.

## Local replacement verification — 2026-11-11

After receiving the organization and permission selections in the guide, the
user provisioned a replacement locally. `pnpm db:validate` passed on
`39866c4b7bffab20a283e110004fec2c75c6ffc5`, using the ignored file without a
shell token override. Clean replay, SQL tests, type freshness, upgrade and
schema parity passed. The runner deleted and verified absence of all three
disposable projects: `dmmennnxgngvbyzfnvcx`, `gdnjugabcdxkyniwvegc` and
`kwswdikyzjphvthalkrr`. This supersedes the local HTTP 401 in BLOCK-01.
Verification of the replacement in GitHub Actions is pending.
