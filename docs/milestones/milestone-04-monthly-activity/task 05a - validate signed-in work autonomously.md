# Task 05a — Validate signed-in work autonomously

Status: `done`

## Objective

Let the implementer and reviewer validate signed-in behavior independently,
without asking the user to sign in, operate the application, or report results.

## Scope

- Enable local access to ordinary Supabase Auth accounts dedicated to agent
  validation in the approved synthetic development project. Keep credentials
  in an ignored local file, outside Next.js configuration, and out of logs.
- Document how to open fresh authenticated browser contexts against a local
  build and how to diagnose access failures. Keep production authentication,
  browser test dependencies, and CI workflows outside scope.
- Update the development workflow and role guidance to verify prerequisites
  early, run checks autonomously, and ask the user only for access they alone
  can grant. Final human acceptance remains a separate step.

## Dependencies

- Task 05 and the existing synthetic Supabase development project.
- Authorization to provision dedicated synthetic accounts and create and
  remove only the fixtures needed for this check. Granted for this task.

## Acceptance criteria

- The implementer and reviewer can each establish their own verified ordinary
  user session in an isolated browser without an interactive Google sign-in.
- Each can verify the saved Activity row and exact totals after reload and in
  a second fresh session for the same account. Each removes only the Activity
  rows they created for their check.
- The workflow distinguishes checks of signed-in application behavior from
  checks of the Google OAuth flow and explains what to do if access is missing.

## Validation

Record the independent live browser checks and cleanup results. Check
documentation formatting and links, plus the applicable tooling checks.

## Progress notes

Task 05 required user-assisted Google sessions. The coordinator subsequently
completed the mobile persistence check once a session was available in a
controllable browser. [Task 05 evidence](https://github.com/manromero/my-clinics/pull/55)

The earlier CI implementation was closed. This task covers access and working
instructions for the agents. [Closed PR](https://github.com/manromero/my-clinics/pull/56)

Provisioned and verified two ordinary Supabase accounts with separate owned
clinics. Their credentials are configured locally outside Git. On the local
production build, the implementer and reviewer each saved a percentage entry
from desktop, verified the exact totals after reload and in a fresh mobile
session, and confirmed removal of only their own validation row. Neither
check required the account holder to sign in or operate the browser.

Lint, type checking, formatting, the production build, local documentation
links, Node syntax and the loopback URL guard passed. The user directed
delivery directly to `develop`.

## Execution context

- Base `367e8b5` on `develop`. The user requested direct delivery on `develop`
  in this session. Use the existing `@supabase/ssr` cookie format.
- Approved synthetic target `lvqbrjybwstvdhaxyxyn`. Use ordinary authenticated
  accounts with separate clinic ownership. Keep operator access out of the
  browser and out of routine validation.
- Correction rounds used: 0.
