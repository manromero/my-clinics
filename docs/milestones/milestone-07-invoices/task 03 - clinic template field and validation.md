# Task 03 — Clinic template field and validation

Status: `pending`

## Objective

Compose FileInput in the existing clinic form and establish useful local PDF
validation without uploads or silently discarded template changes.

## Scope and exclusions

Keep the field route-local and compose it in the single existing ClinicForm for
create/edit. An isolated development/test harness may compose the actual field;
do not duplicate the form. No upload or persistence. Real template mutations stay
unavailable until 04; existing no-template clinic workflows remain usable.

## Dependencies

00 and 02's reviewed design/byte-limit contract; 02 hosted availability is not
required for local work. Use [S02](../../screens.md#s02--clinics),
[template rules](../../requirements.md#invoice-templates-and-generation) and
[milestone sources](readme.md#source-references). Preserve supplied S02 assets and
use current clinic UI/functional text where its HTML duplicates S05.

## Acceptance criteria

- Optional field supports chooser/drop, current filename, staged replacement,
  pending removal, validation/pending/error and save/cancel intent for create/edit.
  Keep persisted descriptors distinct from local Files. Selection never uploads.
- Validate readable fillable PDFs at the agreed maximum 10 MB byte boundary.
  Reject corrupt/unreadable, password-protected/encrypted or missing/wrong-type
  required fields. Require text fields named exactly `invoice_number`, `issue_date`,
  `gross_amount`, `withholding_amount`, `net_amount`; list missing names usefully.
- Choose a minimal PDF library by actual capability checks: inspect text fields,
  reject encryption, fill Spanish accents/euro values, preserve appearance and
  flatten. Deliver synthetic fixtures/validator contracts for authoritative checks
  and 05; do not presume current library APIs.
- Exercise stored/no-template, staged replacement, pending removal, rejected
  selection, cancel and failure retry. Older asynchronous validation cannot
  override a newer selection/removal. Same-file reselection clears resolved errors;
  failures retain entered values.
- Before 04, production template editing is explicitly unavailable: no selectable
  unsaved File is silently ignored by real Guardar. Clearly identify demo state;
  normal clinic fields remain usable. A staged file is never represented as saved.
- Both methods reach the same PDF validation. Keep FileInput domain-free and
  preserve accessible keyboard/mobile behavior and Alexandria/clinic conventions.

## Validation

Run [application checks](readme.md#completion-and-validation), focused validator and
race tests with actual synthetic PDF bytes, and live desktop/mobile create/edit
harness checks: valid/boundary/wrong/corrupt/encrypted PDFs, missing/wrong-type fields,
reselection, replace/remove, cancel and retry. Confirm no selection upload and the
safe production interim form. Capture S02/Alexandria evidence with `chrome-screenshots`.

## Progress notes

Planning only; no library selected/capability asserted, checks or captures performed.
Human acceptance of this refined task is pending.
