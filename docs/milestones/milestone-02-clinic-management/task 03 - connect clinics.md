# Task 03 — Connect Clinics to Supabase

Status: `pending`

## Objective

Make the validated clinic workflow available to Ana with real sign-in and
persistent data across devices.

## Scope

Implement the Supabase-backed data source behind the Task 01 contract and use it
in `/clinics`. Keep test fixtures where they help verify behavior. Provide the
Google sign-in and sign-out flow needed for Clinics, protect the route and every
clinic data operation, and show access-denied feedback for other accounts.
After sign-in, open Clinics for this milestone. The full navigation flow to
Monthly Activity belongs to a later milestone.

## Dependencies

- [Task 01](<task 01 - clinic interactions.md>) and
  [Task 02](<task 02 - supabase clinic contract.md>).
- [S01 — Sign-in and S02 — Clinics](../../screens.md#s01--sign-in).
- A development or test environment with Google sign-in and an authorized test
  account available for end-to-end verification.

## Acceptance criteria

- The authorized account can sign in, list clinics, and create, edit, deactivate,
  and reactivate them. Changes survive reload, sign-out, and sign-in from another
  device. Inactive clinics remain visible.
- The live Clinics screen uses Supabase for all clinic reads and writes. Database
  conflicts reach the appropriate field, failed saves preserve inputs for retry,
  and failed loads provide a retry action.
- Direct visits and data requests without a session or with a different Google
  account do not expose clinic data or allow changes. Signing out removes access
  to Clinics until the authorized user signs in again.

## Validation

Follow the [milestone validation](readme.md#delivery-and-validation). Verify the
Supabase adapter against the clinic contract. Exercise the full flow against the
configured test environment using desktop and mobile sessions, including sign-out,
access denial, save failure and retry, and data persistence across devices.

## Progress notes

Implementation pending assignment.
