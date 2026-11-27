# Task 02 — Private template infrastructure

Status: `in_progress`

## Result

One private `clinic-templates` bucket and one stored object per upload. The server
validates those same bytes before atomically associating the PDF with its clinic.
There is no temporary bucket, duplicate copy, batch collector or scheduled service.
The PR contains one final migration: `20261126230000_private_templates.sql`.

## Contract for the following tasks

- Use ordinary signed uploads to fresh UUID paths with overwrite disabled. No
  account or service credential is returned to the browser.
- Enforce the inclusive 10,000,000-byte limit. Reject unreadable/encrypted PDFs and
  missing or wrong-type text fields: `invoice_number`, `issue_date`,
  `gross_amount`, `withholding_amount` and `net_amount`.
- Preserve optional filenames, active/inactive clinics and no-template workflows.
  Save clinic fields and the template association atomically. Cancel and failed
  Save preserve the previously saved pair; recorded outcomes support safe retries.
- Cancel and invalid validation delete their own upload. Replacement/removal delete
  only the affected previous file after the clinic transaction succeeds. Retrying
  that same operation retries its deletion. A cleanup error does not reverse a
  committed Save or trigger a scan of other files.
- The real private PDF-read API checks the current owner/association and returns
  private/no-store bytes. No demonstration or test routes were added.

Clinic-form integration and invoice generation remain in the following tasks.
Obsolete research scripts/results and intermediate narratives are removed; the
[decision](template-storage-decision.md) contains final conclusions and the
[operating guide](template-storage-runbook.md) contains current setup and usage.

## Validation and deployed state

Application checks, 389 tests, eight tooling tests, official type generation,
replay/type freshness/parity/upgrade checks and ordinary hosted SDK/production
checks passed. Thirteen development business checks passed with the two existing
fixture accounts. Independent code, procedure and live rollout review passed at
`4e01a65f5c2f2da3388cfdc97b22fbeb1ebfc40d`, with no blockers.

Development `lvqbrjybwstvdhaxyxyn` is healthy and its approved public API exposure
is restored. History contains the six original migrations and only the final
template migration. The previous two buckets are gone. Original data digests are
unchanged: 14 clinics, 63 activity rows and seven owner IDs. Fixture clinics and
PDFs are removed; zero stored objects and zero current links remain. Small request
outcomes remain for idempotency. Production was not modified.

## Limits

An abandoned upload, late-arriving bytes or a failed deletion can remain private
without retrying that specific operation. No idle cleanup deadline is promised.
Interrupted standard uploads may need whole-file retry. The existing Next.js
advisory remains separate follow-up scope. No deployed Vercel or physical mobile
network behavior is inferred from the local production checks.

## Delivery

Final cleanup requested: remove the redundant standalone template-test command and
entry point, plus task-generated local temporary artifacts. Keep the validation
module used by `db:validate` and useful regression tests. No database change is
needed; cleanup validation and independent review are pending.

[PR #72](https://github.com/manromero/my-clinics/pull/72), targeting `develop`.
Automatic correction rounds used: 1 of 2. Human acceptance and manual merge remain
pending; final completion tracking receives documentation review.

Sources: [requirements](../../requirements.md#invoice-templates-and-generation),
[architecture](../../architecture.md), [database rules](../../../supabase/AGENTS.md)
and [Supabase guide](../../supabase.md).
