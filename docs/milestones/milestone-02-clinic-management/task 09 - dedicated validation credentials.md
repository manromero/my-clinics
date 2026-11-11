# Task 09 — Configure dedicated database validation credentials

Status: `pending`

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
Renumbered from Task 10 to Task 09 on 2026-11-11. Implementation is pending assignment.
Task 04 continues with the explicitly authorized current CLI token and its CI
secret. [Milestone 03](../milestone-03-authentication/readme.md) covers application
authentication and authorization.
