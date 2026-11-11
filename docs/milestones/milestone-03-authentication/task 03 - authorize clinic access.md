# Task 03 — Restrict clinics to their owners

Status: `pending`

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
Configure Google in the separate production Supabase project and use that
project's `/auth/v1/callback` URL as the Google web client's authorized
redirect URI. Redeploy and verify Google sign-in, reload, and sign-out on
the production domain.
[Vercel sign-in origins](../../supabase.md#vercel-sign-in-origins)

## Progress notes

Implementation pending assignment.
