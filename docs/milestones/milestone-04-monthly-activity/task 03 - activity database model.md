# Task 03 — Create the activity database model

Status: `in_progress`

## Objective

Provide an owner-scoped activity store and a trusted write path that enforces
the activity rules for every caller.

## Scope

- Model the activity ID, owner, clinic reference, calendar date, optional
  description, signed price, explicit mode, optional direct amount, applied
  percentage and IRPF, and immutable creation order. Use exact decimals.
  Index the owner and date range used by monthly reads and support stable
  ordering. Enforce that the referenced clinic belongs to the same owner and
  cannot be deleted while referenced.
- Restrict access with RLS and explicit grants. Create, update, and delete
  through a trusted, transaction-safe interface. Derive the owner from the
  session and read current clinic eligibility and rates at write time. The
  app role must not be able to bypass the write rules with direct table calls
  or forge ownership, snapshots, or calculated amounts.
- Make gross and net authoritative in the database using the
  [confirmed formulas](../../requirements.md#currency-and-rounding).
  Use the same rounded row values for reads and totals. Support complete
  period aggregates without depending on the size of a returned page.
- Update desired schema, append a migration, extend replay and upgrade
  checks, and regenerate database types using the existing hosted tooling.
  Use synthetic data only.

## Dependencies

- Task 02 and the contract from Task 00.
- [Milestone 03 Task 03](<../milestone-03-authentication/task 03 - authorize clinic access.md>).
- [Database agent rules](../../../supabase/AGENTS.md) and the
  [Supabase guide](../../supabase.md).

## Acceptance criteria

- Create snapshots the current clinic percentage and the initial 15% IRPF
  default through the trusted path. Inactive and cross-owner clinics cannot
  be assigned. An edit that keeps its clinic retains both snapshots and can
  keep an inactive clinic; reassignment updates only the percentage snapshot.
  The stored IRPF survives every edit.
- Reject malformed or non-finite amounts, excess precision, invalid mode/direct-amount
  combinations, and spoofed owner or rate input. In percentage mode a
  price change uses the saved rate. In direct mode the explicit amount
  determines gross while the original price is retained.
- Exact signed rounding handles both modes and half-cent ties, including
  negative values. For example, a percentage row priced at `-0.05` at
  `10%` has a gross of `-0.01`; a direct gross of `-0.10` at `15%`
  has a net of `-0.09`. Zero values are valid. Compare these cases with the
  form preview contract.
- Anonymous requests cannot read or write, and an authenticated user cannot
  read or mutate another user's activity, attach it to another user's clinic,
  or bypass the write invariants. Existing clinics, owners, and policies
  survive the upgrade.

## Validation

Run the repository's application and database checks as applicable, including
authorized hosted replay, schema parity, upgrade preservation, type freshness,
and SQL role tests. Test two users, anonymous calls, bypass attempts, clinic
deactivation or rate changes before save, and signed rounding. Follow the
documented migration procedure before using the schema on the integration
target; approval for the task plan does not authorize applying a migration.

## Progress notes

Implementation and independent review are in progress.

## Execution context

- Ready for implementation: the approved scope and rounding contract are
  documented, Task 02 is merged, and clinic ownership policies are present.
- Branch: `feature/activity-database-model`; base:
  `459d0bcf7884d1a5d3084b40b97bf78ac74348cf` on `develop`.
- The fixture preview uses integer cents and basis points, rounding each row
  away from zero at a half-cent. Match this behavior without changing the UI.
- Extend the existing public schema, catalog, replay, and upgrade coverage as
  applicable. Prove role isolation and verify a clinic's current state under
  concurrent writes. Keep reads and totals independent of pagination.
- Run hosted validation only through the authorized disposable lifecycle in
  the Supabase guide. Do not apply the migration to shared development.
- No open product questions. Correction rounds used: 0.
