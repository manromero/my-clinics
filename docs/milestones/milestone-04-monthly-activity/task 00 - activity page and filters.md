# Task 00 — Define the activity page and filters

Status: `pending`

## Objective

Create the responsive structure of S03 and establish the contract shared by
fixtures and the later server data source.

## Scope

- Compose the signed-in header, page title, period controls, clinic filter,
  and regions for totals, list, and entry actions using existing components.
  Use a development fixture harness for early review; keep the normal sign-in
  destination and navigation unchanged until Task 06.
- Specify URL parameters for year/month and optional clinic ID, with one
  normalization rule reused by later reads. Default to the current month in
  Europe/Madrid and all clinics. Treat IDs as opaque strings and dates as
  calendar dates; transport exact decimal values as strings or integer units.
- Define the route's view data for a normalized scope, eligible clinic
  options, rows, totals, and creation availability. Keep fixture state
  replaceable and keep database response types out of UI components.

## Dependencies

- Shared components from [Milestone 01](../milestone-01-shared-components/readme.md)
  and session patterns from [Milestone 03](../milestone-03-authentication/readme.md).
- [S03 specification and references](../../screens.md#s03--monthly-activity)
  and [architecture](../../architecture.md).

## Acceptance criteria

- The screen makes its period and clinic scope clear on desktop and mobile.
  Changing period works across year boundaries; refresh and browser history
  preserve valid selections. Invalid period values recover predictably.
- Active clinics are selectable even without activity. An inactive clinic is
  selectable only when it has activity in that period. A clinic that ceases
  to be eligible when the period changes resets to all clinics; unknown clinic
  IDs follow the same rule without disclosing another account's data.
- The fixture harness needs no database writes and does not make sample data
  available in the normal signed-in journey. There are no broken links to S04
  or S05.

## Validation

Run the application checks and production build. Verify URL handling,
Europe/Madrid month rollover, keyboard access, and narrow layout live; capture
desktop and mobile evidence.

## Progress notes

Proposed; implementation has not started.
