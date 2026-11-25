# Task 05 — PDF fill and flatten engine

Status: `pending`

## Objective

Generate a faithful flattened PDF from actual template bytes and invoice values,
independently of the screen renderer and hosted integration.

## Scope and exclusions

Implement the minimal fill/flatten engine and meaningful synthetic PDF tests with
the chosen validator/library. No fake HTML invoice, shared PdfViewer, route renderer,
download UI, hosted fetching or generated invoice persistence/history.

## Dependencies

01 validation/calculation contracts and 03 library, validator and fixtures. Use
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
  Define input/output version contracts usable by 06.
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

Planning only; no library capability, generated output or validation is claimed.
Human acceptance of this refined task is pending.
