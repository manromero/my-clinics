# Clinic database model

Task 05 defines `public.clinics` independently of the current memory preview.
The UUID `id` primary key defaults to `gen_random_uuid()`; later repositories
retain it on edits. `name`, `percentage` and `active` are required. Only `active`
has a business default (`true`). No activity, deletion API, application integration,
authentication, RLS or permission configuration is introduced here. Hosted Data
API access remains disabled and all validation data is synthetic.

## Names

`clinic_name_key(text)` trims the ECMAScript `String.trim()` whitespace set and
lowercases the result. The unique expression index applies to active and inactive
rows alike; an unchanged key on the same row is valid. Internal whitespace and
accents remain significant. Stored display names retain supplied text; later
services can continue trimming input as the memory source does.

PostgreSQL `lower` uses the database collation rather than JavaScript's Unicode
implementation. ASCII and ordinary Spanish accented names are covered by database
tests; this is not a promise of identical case conversion for every Unicode
character or locale. The database index is authoritative for later conflict mapping.

## Exact percentages

The unconstrained `numeric` column deliberately has no precision/scale typmod.
PostgreSQL would coerce a `numeric(5,2)` input before checking constraints and
could silently accept `100.001` as `100.00`. Separate constraints require the
original numeric value to be between 0 and 100 and equal to `trunc(value, 2)`.
Excess nonzero fractional digits fail on inserts and updates. Redundant trailing
zeros (for example `12.3400`) are accepted, matching the memory source's numeric
contract. NaN and infinities fail the range check.

Callers must pass the original numeric value without pre-rounding or casting to a
limited-scale numeric: no database can recover precision already discarded by a
caller. The hosted tests send direct unrounded numeric literals.

## Later error mapping

| SQLSTATE | Identifier                                    | Meaning                                    |
| -------- | --------------------------------------------- | ------------------------------------------ |
| `23505`  | `clinics_name_key_unique`                     | Name conflicts after normalization         |
| `23514`  | `clinics_name_nonblank`                       | Name contains only surrounding whitespace  |
| `23514`  | `clinics_percentage_range`                    | Percentage outside inclusive bounds        |
| `23514`  | `clinics_percentage_precision`                | Percentage has excess fractional precision |
| `23502`  | Column `name`, `percentage`, `active` or `id` | Required value is null                     |
| `23505`  | `clinics_pkey`                                | Duplicate identity, not a name conflict    |

A value can violate multiple checks; PostgreSQL does not promise which check is
reported first. Later repositories should map both percentage checks to the
existing invalid-percentage outcome and reserve duplicate-name for the named
unique index. UUID syntax failures (`22P02`) and unexpected database failures
remain distinct from name conflicts. This document records identifiers, not a
new error mapping implementation.

## Validation and upgrades

The declarative schema was authored first and the initial migration authored
manually from it. Existing catalog reconciliation covers every introduced
feature: tables, UUID/numeric/text/boolean columns, defaults, nullability, checks,
expression indexes and SQL routine definition/configuration. No additional object
kind is needed. Comments are reviewed separately from semantic parity.

`supabase/seed.sql` uses stable synthetic UUIDs, active/inactive examples and 0,
100 and 37.25 percentages. The authorized disposable runner applies it twice and
compares rows. Automatic CLI seeding stays disabled, preventing incidental shared
project writes.

SQL assertions cover required fields, whitespace normalization, case, unchanged
names, edits, state transitions, exact boundaries and invalid precision/range.
Independent Management API requests test insert/insert, insert/update and
update/update uniqueness. The runner observes distinct PostgreSQL backends and
the contender waiting on the winner's transaction before checking one committed
winner and a `23505` rejection. Regressions to limited-scale numeric or missing
constraints/index must make the same SQL suite fail; each control rolls back.

The previous application schema/history was empty, so no clinic row can predate
this migration. An additional disposable target replays that previous baseline,
commits a synthetic row in a test-only schema, applies the actual clinic migration,
and verifies the original row unchanged, an empty clinic table and catalog parity
with clean replay. This is separate from the retained infrastructure upgrade
fixture. No reset or shared project write is involved.

Sources: PostgreSQL [numeric types](https://www.postgresql.org/docs/current/datatype-numeric.html),
[expression indexes](https://www.postgresql.org/docs/current/indexes-expressional.html),
and [unique index concurrency](https://www.postgresql.org/docs/current/index-unique-checks.html).
