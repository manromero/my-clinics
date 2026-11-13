# Task 05a — Automate hosted activity acceptance

Status: `done`

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
[PR #55](https://github.com/manromero/my-clinics/pull/55).

The user approved reusing synthetic development project `lvqbrjybwstvdhaxyxyn`
for unattended acceptance, with exclusive test accounts and cleanup limited to
activities created by each run. [PR #55](https://github.com/manromero/my-clinics/pull/55)
is merged into `develop`. Its hosted acceptance used interactive Google sessions.

Implementation and review are recorded in
[PR #56](https://github.com/manromero/my-clinics/pull/56). Independent review of
`7ef352e6a91ccf4fde10641c19e38a7ee1dc0836` found no remaining blockers or optional
findings after two correction rounds. An ambiguous save now reports unresolved
cleanup and retains the run's exact recovery scope.

[Application checks](https://github.com/manromero/my-clinics/actions/runs/43429844727)
passed lint, type checking, formatting, all 276 tests, and the production build.
The four hosted tooling checks passed, and the Playwright entry point rejected an
unapproved project before launch. The
[hosted run](https://github.com/manromero/my-clinics/actions/runs/43429836945)
passed desktop and mobile persistence, independent sign-in, and cleanup. The
deliberate desktop failure produced redacted diagnostics and verified removal of
its row. A read-only hosted query found zero suite rows and 56 other rows. Human
approval and manual merge are pending.

## Execution context

- Ready for implementation. Branch: `feature/hosted-activity-acceptance`.
  Base: `c6903e46034aa5847cef4f69fa6c06f35517ec65` (`origin/develop`).
- The route is `src/app/activity`. Reuse the Supabase SSR session format and
  existing server checks. Keep test sign-in outside the application and leave
  Google OAuth acceptance separate.

- `supabase/schemas/30-activity.sql` grants `delete_activity` to authenticated
  owners. Provision reusable synthetic clinic fixtures once. Isolate the tested
  totals and clean up only rows matching the run marker and expected scope.
  Verify the exact target and dedicated account before any activity write.

- GitHub's default branch is `main`. Provide a trusted pre-merge trigger and
  restrict the GitHub environment to allowed refs before storing credentials.
  The two dedicated accounts and clinics are provisioned. GitHub environment
  secrets are restricted to `develop` and the exact feature branch for validation.
- No open product decisions. Correction rounds used: 2.
