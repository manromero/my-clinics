# Task 03 — Restrict clinics to their owners

Status: `in_progress`

## Objective

Require a verified Supabase Auth session for clinic access and associate each
clinic with its owner.

## Scope

- Protect `/clinics` and all clinic server reads and writes. Run database requests
  in the signed-in user's context so Supabase RLS applies.
- Associate each clinic with the owning Supabase Auth user ID. Derive ownership
  on creation from the verified session. Scope the existing normalized-name
  uniqueness rule to the owner so independent users can use the same name.
- Replace temporary anonymous grants and policies. Grant only the operations
  needed by signed-in users and use RLS with `auth.uid()` for owner-only
  `SELECT`, `INSERT` and `UPDATE`. Check both the existing and resulting row on
  update to prevent ownership changes. Keep persistent deletion unavailable.
- Plan the treatment of the existing synthetic rows before rollout. Record an
  explicit owner mapping for rows being retained. Keep existing rows inaccessible
  to unrelated accounts throughout the transition.
- Update the desired schema, reviewed migration and generated types through the
  [hosted database workflow](../../supabase.md). Document the manual rollout and
  verify the policies before using real data or opening the app for public use.

## Dependencies

- [Task 02](<task 02 - supabase sign-in.md>) and
  [Milestone 02 Task 08](<../milestone-02-clinic-management/task 08 - update persistent clinics.md>).
- [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
  and [database agent rules](../../../supabase/AGENTS.md).
- An approved test environment with synthetic data and two Google accounts.

## Acceptance criteria

- A signed-in user can list, create, edit, deactivate and reactivate their own
  clinics. Saved changes are visible after reload and in another session for
  the same account.
- The app redirects signed-out users to sign-in. Missing or expired sessions
  and direct unauthenticated requests cannot read or change clinic data.
- A second account can manage its own clinics. Direct Data API calls and
  application requests cannot expose or modify the other account's clinics,
  create clinics for it or transfer ownership. Persistent deletion is denied.
- Each account can use the same clinic name independently. Duplicate-name
  validation within one account, save/cancel and failure/retry behavior still work.

## Validation

Run the required application checks and build, hosted migration replay, upgrade
and type checks, and RLS and grants tests. Exercise the app and direct Data API
with two signed-in accounts and a signed-out session. Check clinic operations,
cross-device persistence, sign-out, expired sessions and the synthetic data
transition. Verify the protected flow on desktop and mobile.

## Production rollout reminder

After verifying owner-only clinic access, configure the approved production
Supabase URL and publishable key in Vercel Production and set
`APP_ORIGIN=https://my-clinics.vercel.app`. Set the production Supabase
**Site URL** to `https://my-clinics.vercel.app` and add the exact
`https://my-clinics.vercel.app/auth/callback` under **Redirect URLs**.
If production uses a separate Supabase project, configure Google for that
project and register its `/auth/v1/callback` URL as the Google web client's
authorized redirect URI. Redeploy and verify Google sign-in, reload, and
sign-out on the production domain.
[Vercel sign-in origins](../../supabase.md#vercel-sign-in-origins)

## Progress notes

Implementation started on 2026-11-11. Correction rounds used: 0 of 2.

- [Draft PR #49](https://github.com/manromero/my-clinics/pull/49) targets
  `develop`. Implementation head `e44b0bd8f619c8a24a414fed08e8b5268cfb54ca`
  passed lint, type checking, formatting, the production build, 266 application
  tests, and five database tooling tests. Hosted validation passed clean replay,
  generated-type freshness, owner policy and grant tests, the ownership upgrade,
  schema parity, and disposable project cleanup. The PR includes desktop and
  mobile evidence using controlled Auth and Data API responses.
- The user approved deleting the existing synthetic clinics from shared
  development during rollout. The owner mapping is empty for that inventory.
  The migration preserves and isolates existing rows. Any approved deletion is
  a separate operator transaction after preservation is verified.
- The approved shared development rollout applied migrations `20261110190000`
  and `20261111120000` from `7d6b259cf3a17d6f514c768783f0050700224ce7`.
  The user approved keeping the Data API active for this rollout. Migration
  history and the catalog check passed. The owner policies were in place, and
  the anonymous Data API read returned HTTP 401 with SQLSTATE `42501`.
  An operator transaction verified the unassigned inventory and removed all
  seven approved synthetic clinics. A read-only check confirmed zero
  remaining rows.
- The user confirmed the manual acceptance checklist passed in the preview
  with two Google accounts, including isolation, duplicate-name behavior,
  clinic edits, persistence in a separate session, and sign-out. A read-only
  query corroborated that saved clinics have two distinct owners. The live Data
  API rejected anonymous reads, inserts, updates, and deletes with HTTP 401
  and SQLSTATE `42501`. Direct authenticated cross-account probes remain
  pending.
- Independent review at `634ad26ffcebca32e9c5d8a78401dca9c13aa868` repeated
  the application and hosted validation checks. Desktop and mobile Chrome
  verified the protected flow, account separation, clinic edits, and save
  failure and retry with controlled responses. No code or visual blocker was
  found. Live acceptance remains the blocking check. No correction rounds
  were used.

## Execution context

- Task 02 is integrated in PR #48 and Milestone 02 Task 08 is complete.
  The branch `feature/authorize-clinic-access` starts from `develop` at
  `5e36dfb8d651e3998b59ecae2cfb97c5a4a74beb`.
- Reuse the Supabase SSR session and refresh infrastructure in
  `src/lib/supabase` and `src/proxy.ts`. The page and data operations are
  in `src/app/clinics`. The current anonymous grants and policy tests are
  in `supabase/`.
- Use the [requirements](../../requirements.md#access-and-devices),
  [architecture](../../architecture.md#supabase-boundaries), and
  [sign-in and clinics references](../../screens.md#s01--sign-in).
- Repository implementation can proceed with existing synthetic rows isolated
  from application roles. The operator must confirm disposition and explicitly
  map any rows retained for application use before rollout. Hosted checks
  require disposable lifecycle authorization and live acceptance requires two
  Google accounts in the approved synthetic environment.
