# Task 05 — PDF fill and flatten engine

Status: `pending`

## Objective

Generate a faithful flattened PDF from actual template bytes and invoice values,
independently of the screen renderer and hosted integration.

## Scope and exclusions

Implement the minimal fill/flatten engine and meaningful synthetic PDF tests with
the already selected `pdf-lib` 1.17.1 and existing contracts/fixtures. No fake HTML invoice, shared PdfViewer, route renderer,
download UI, hosted fetching or generated invoice persistence/history.

## Dependencies

01 and 03 are complete. Reuse `invoiceFields` and input validation from
`src/app/(signed-in)/invoices/invoice-contracts.ts`, the five field names and byte
limit from `src/lib/templates/pdf-contract.ts`, the existing validator, and
`src/lib/templates/pdf-fixtures.ts`. `pdf-lib` is already pinned; do not repeat
library selection or rebuild template persistence. Use
[invoice rules](../../requirements.md#invoice-templates-and-generation),
[S05 output](../../screens.md#live-preview-and-download) and
[milestone sources](readme.md#source-references).

## Acceptance criteria

- Consume actual validated PDF bytes and input snapshot. Fill only `invoice_number`,
  `issue_date`, `gross_amount`, `withholding_amount`, `net_amount`. Clear defaults/
  residual values for missing/invalid inputs; calculated fields require valid gross.
- Preserve entered invoice zeros; format `dd/MM/yyyy` and Spanish money with two
  decimals/euro. Fixed 15% half-up withholding precedes subtraction, including
  0.10 → 0.02/0.08.
- Preserve appearance on every page, with visible Spanish accents/euro appearances,
  and flatten fields into fixed noneditable content. Add no watermarks, editable
  billing/concept/bank fields or fiscal/PDF-A claims.
- Reject corrupt/unreadable, encrypted/password, missing-name and wrong-type
  templates usefully. Failures do not return an earlier successful output as new.
  Expose a small input/output API usable by 06; its caller tracks snapshot
  freshness. Do not add a separate persistence or versioning subsystem.
- Verify actual synthetic multipage PDFs with accented/static text, euro symbols,
  default field values and partial/invalid inputs. Produce standalone PDF artifacts
  and open representative output; parsing bytes alone does not prove appearance
  or flattening.

## Validation

Run [application checks](readme.md#completion-and-validation) and focused engine
tests for rounding, cleared defaults, appearance/flattening and invalid bytes.
Render/inspect all pages of representative standalone PDFs; verify noneditable
fields. Record actual artifacts, source template, renderer and head, using
`chrome-screenshots` where Chrome captures supply visual evidence. UI layout review
does not apply; PDF visual review does. End-to-end browser download belongs to 06.

## Progress notes

2026-11-27: Reconciled at the user's request with completed tasks 01–03.
The selected library, input calculations, validation and synthetic template helper
already exist. Filling, appearance preservation and flattened output remain the
new work; they must still be independently tested, not inferred from validation.
No engine implementation or generated-output verification is claimed. Status
remains `pending`; the user accepted the rewritten definition on 2026-11-27.

Use existing application routes for any later integration. Do not restore the
invoice or clinic-template demonstration pages removed in tasks 01 and 03.
