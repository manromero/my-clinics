# Task 02 — Private template infrastructure

Status: `in_progress`

## Objective

Provide the simplest private PDF-template infrastructure needed by clinics and
invoices: one definitive Storage bucket, one stored object per upload, server
validation and coherent clinic/template saves.

## Approved scope

The user reopened PR #72 to simplify the design, code, validation and
documentation. The current requirements supersede the earlier two-bucket design:

- Use one private bucket and a fresh immutable object key for each upload. Upload
  once, with overwrite disabled. Validate those same stored bytes before linking
  them to a clinic; do not create a second PDF copy.
- Keep owner-only metadata and byte access, authoritative PDF validation and the
  inclusive 10,000,000-byte limit. Reject unreadable or encrypted PDFs and missing
  or wrong-type text fields: `invoice_number`, `issue_date`, `gross_amount`,
  `withholding_amount` and `net_amount`.
- Preserve optional filenames, active/inactive clinics and no-template workflows.
  Save clinic fields and their template association atomically. Preserve the saved
  pair on Cancel or failed Save, and handle retries and concurrent saves coherently.
- Delete only the file affected by the concrete operation: rejected/cancelled
  upload, replaced template or removed template. Retrying that same operation may
  retry its deletion. Do not scan unrelated files or add batch collectors, daily
  maintenance, queues or background services.
- Keep the real private PDF-read API and essential regression tests. Remove
  obsolete research scripts/results and intermediate narrative documents. Final
  documentation and the PR description should contain conclusions, current usage,
  checks and material limitations only.

No clinic-form integration, invoice generation/history, public deployment or
production-project changes are included. Subsequent tasks retain those scopes.

## Database correction

The user explicitly instructed that the erroneous
`20261126160000_private_templates.sql` migration must not remain in the PR. This
is a task-specific exception to retaining that applied migration, not a general
change to repository database rules. Deliver one correct final creation migration.

Prepare and independently review the exact development-only reconciliation before
hosted writes. Preserve all existing clinics, activity and owners; do not reset the
database or alter unrelated migration history. Inventory template links and objects
before removing the former template-only infrastructure. Production is excluded.

## Validation and acceptance

Follow [database rules](../../../supabase/AGENTS.md), the
[Supabase guide](../../supabase.md), [architecture](../../architecture.md) and
[invoice requirements](../../requirements.md#invoice-templates-and-generation).

Run the required application checks, focused useful tests, generated-type/replay/
parity/upgrade validation and applicable actual Storage API checks on authorized
synthetic targets. Use the ordinary supported SDK flows and provider contracts;
do not claim unperformed probes passed. No test pages or UI screenshots are needed.

Independent review must verify current code, functionality, database preservation,
private access and the final documentation before completion. Do not merge the PR.

## Execution context

- Branch: `feature/private-template-infrastructure`; PR:
  <https://github.com/manromero/my-clinics/pull/72> (draft during revision).
- Base: `22942979af63c2db5c7331fc9726c3a75d022f0d`.
- Development target: `lvqbrjybwstvdhaxyxyn`, `my-clinics_dev`, organization
  `njnmfutclorywskqrftd`. The earlier two-bucket version is deployed there; the
  replacement and its scoped history correction have not been applied.
- Preserve the verified baseline: 14 clinics, 63 activity rows and seven owner IDs.
  Recheck current data and links before any reconciliation.
- Previous automatic correction rounds used: 1 of 2; not reset by this user-directed
  revision. Prior validation covers the former implementation, not the current edits.
- Current implementation and verification are in progress. Record final conclusions
  in the decision document and operating guide, with detailed validation in the PR.
- Failed deletion, abandoned upload or late-arriving bytes cannot be guaranteed
  reclaimed while idle without an additional trigger. State that limit plainly;
  do not reintroduce a collector or promise a cleanup deadline.
