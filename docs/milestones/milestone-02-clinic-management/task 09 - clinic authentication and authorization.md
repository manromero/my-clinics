# Task 09 — Secure persistent Clinics with Google authentication

Status: `pending`

## Objective

Complete persistent clinic management for Ana across desktop and mobile, with
Google sign-in and enforced access controls for every persistent operation.

## Scope

Implement Google sign-in/sign-out, authorized-account configuration, route and
server-operation authorization, database RLS and permissions for list, create,
edit, deactivate and reactivate. Apply security schema changes through the
established declarative/migration workflow and refresh generated types. Restrict
access to Ana's configured Google identity; keep secrets outside source control
and client bundles. After sign-in, open Clinics; monthly activity navigation
belongs to a later milestone.

This is the mandatory gate before real data or public use. Earlier tasks establish
only hosted development synthetic-data behavior and do not satisfy access requirements. Document
configuration and the manual remote procedure; remote mutations require a separately
authorized, explicitly verified target, rather than automatic deployment in CI.
Keep current configuration and operating steps concise in the existing Supabase
guide; keep execution history, future plans and validation evidence in the task/PR.

Decision renewed on 2026-11-07: persistent deletion stays deferred until a real
activity relationship can enforce eligibility. Keep it unavailable on the persistent
screen and in persistent service/server/database permissions. Deletion remains
available only in the separate in-memory preview. Do not add an activity table,
patients, appointments, monthly activity UI, reports or IRPF settings in this task.

## Dependencies

- [Task 08](<task 08 - update persistent clinics.md>) and the preceding database
  validation and service boundary.
- [Access requirements](../../requirements.md#access-and-devices),
  [saving requirements](../../requirements.md#saving-and-date-defaults),
  [S01](../../screens.md#s01--sign-in) and [S02](../../screens.md#s02--clinics).
- A configured Google provider, Ana's authorized identity and an authorized test
  environment/account arrangement for end-to-end and cross-device verification.
  Missing credentials or infrastructure must be reported, not treated as a pass.

## Acceptance criteria

- Ana can sign in with Google, list, create, edit, deactivate and reactivate clinics,
  sign out and sign in again. Changes survive reload and appear in another desktop
  or mobile session using the same authorized account.
- Unauthenticated sessions and other Google accounts cannot view clinic data or
  execute any persistent operation, including direct requests bypassing the UI.
  Unauthorized users receive appropriate Spanish access feedback. Sign-out removes
  access and prevents previously loaded data from being exposed through stale UI.
- Every server entry point authorizes access before service execution. Database
  policies and permissions independently reject unauthorized reads/writes; any
  privileged infrastructure cannot bypass the application authorization boundary.
- Database and application validation, error mapping and service boundaries remain
  intact. Save/cancel, load/save failure, retained inputs, retry, and duplicate
  submission prevention work for all supported persistent operations.
- Persistent deletion is unavailable and denied through direct operations for all
  application identities, including Ana. No activity schema is introduced.
- Desktop/mobile presentation follows S01/S02, Alexandria and Stitch. Secret values
  remain server-only; configuration and safe manual deployment steps are documented.

## Validation

Follow [milestone validation](readme.md#delivery-and-validation). Run database
migration/parity/type and upgrade checks, authorization/RLS/permission tests for Ana,
another authenticated account and anonymous access, and direct-request tests for
every persistent operation, including denied deletion. Verify sign-out and stale
session behavior. Exercise all persistent list/create/update/state flows, cancel,
recoverable failures/retries and cross-device persistence with synthetic test data.
Run application checks, production build and regression tests, including the separate
in-memory deletion preview. Capture desktop/mobile evidence for sign-in, denied
access and Clinics against the visual references. Record actual configured-environment
results; unavailable Google or cross-device checks prevent clean final acceptance.

## References

- [Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
- [Row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Database testing](https://supabase.com/docs/guides/database/testing)
- Relevant installed Next.js guides under `node_modules/next/dist/docs/`.

## Progress notes

Implementation pending assignment. Planning decision recorded on 2026-11-07;
this task definition does not start implementation. Authentication and access
control are deferred to this task, not removed from milestone acceptance.
