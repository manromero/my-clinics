# Task 05a — Automate hosted activity acceptance

Status: `pending`

## Objective

Run the browser acceptance checks for persistent Activity in CI without a
developer signing in or entering test data for each run.

## Scope

- Add a Playwright suite that exercises the [Monthly activity screen](../../screens.md#s03--monthly-activity)
  in desktop and mobile browser projects against an approved hosted Supabase
  environment containing only synthetic data.
- Use dedicated test accounts and real Supabase Auth sessions. Supply credentials
  through CI secrets and limit the job to trusted runs. Verify the target before
  any write and follow the [hosted Supabase guide](../../supabase.md).
- Isolate the test data for each run and clean up only that run's records after
  success or failure. Document the one-time setup and how to run and diagnose the
  suite. Keep Google OAuth acceptance separate for changes to authentication.

## Dependencies

- [Task 05](<task 05 - create persistent activity.md>) and an approved hosted
  synthetic target with dedicated test accounts and a scoped cleanup path.

## Acceptance criteria

- A trusted CI run authenticates without manual input. The tests use ordinary
  authenticated sessions and exercise the application's existing access checks.
- In each browser project, the suite creates an activity through the UI, checks
  the saved row and exact totals, and verifies both after reload and in a second
  context authenticated independently as the same test account.
- Repeated or overlapping runs cannot affect one another's results. Cleanup
  leaves other data intact and reports any failure. CI publishes the result and
  useful failure traces with credentials and live session data kept out of
  published artifacts.

## Validation

Run the application checks and build. Verify a successful CI run on desktop and
mobile and a deliberate failure that produces usable diagnostics and still
cleans up. Verify that an unapproved target is rejected before any write.

## Progress notes

Defined after the user-assisted hosted acceptance of Task 05 in
[PR #55](https://github.com/manromero/my-clinics/pull/55). Implementation has not started.
