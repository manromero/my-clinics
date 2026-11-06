# Task 02 — Set up Supabase and define the clinic database contract

Status: `pending`

## Objective

Provide a reproducible Supabase environment and a protected clinic data model
that supports the operations agreed in Task 01.

## Scope

Set up Supabase for development and document environment variables, migration
commands, and Google provider configuration. Define the clinic schema and access
rules in a versioned migration. Keep environment secrets and the authorized
account configuration out of version control. The Clinics UI continues to use
the in-memory data source until Task 03.

## Dependencies

- [Task 01](<task 01 - clinic interactions.md>).
- [Clinic requirements](../../requirements.md#clinics) and
  [access requirements](../../requirements.md#access-and-devices).

## Acceptance criteria

- A fresh development database can apply the committed migration using the
  documented setup. The schema defines stable IDs, names, exact percentages,
  and an active state that defaults to active.
- Database constraints reject blank and duplicate names after trimming and
  ignoring case, including conflicting writes. Percentages must be within 0–100
  with at most two decimal places. Document how data and constraint errors map
  to the contract from Task 01.
- Row-level security and database permissions allow the configured authorized
  identity to list, insert, and update clinics. Anonymous sessions and other
  authenticated identities cannot read or write clinic data. Deletion is outside
  the application contract.

## Validation

Follow the [milestone validation](readme.md#delivery-and-validation). Apply the
migration to a fresh development database and verify valid and invalid writes,
name conflicts, and read and write access for authorized, unauthorized, and
anonymous sessions.

## References

- [Supabase migrations](https://supabase.com/docs/guides/local-development/database-migrations)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)

## Progress notes

Implementation pending assignment.
