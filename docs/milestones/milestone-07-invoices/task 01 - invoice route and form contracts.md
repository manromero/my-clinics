# Task 01 — Invoice route and form contracts

Status: `pending`

## Objective

Prepare authenticated invoice navigation, screen skeleton and exact input/
calculation contracts before connecting templates or PDF output.

## Scope and exclusions

Use existing controls and explicit development/test fixtures. Exclude template
upload, PDF output, invoice records and fake production successes/downloads. Do
not force FormPanel Save/Cancel semantics onto the invoice generation workflow.

## Dependencies

Existing controls, clinic selector patterns and authenticated shell; independent
of 00. Use [invoice rules](../../requirements.md#invoice-templates-and-generation),
[S05](../../screens.md#s05--invoices) and [milestone sources](readme.md#source-references).

## Acceptance criteria

- Add `/invoices` to actual signed-in shell destination/current-route contracts.
  Desktop/mobile navigation and keyboard order are Clínicas → Actividad → Resumen
  → Facturas, with visible/announced current page. Direct/auth/back/forward links
  work; Activity remains landing page. Preserve monthly scope through Invoice visits.
- TextInput keeps a string of one to four digits, integer value 1–9999, preserving
  leading zeros. Reject zero, spaces, letters and longer values.
- DateInput uses valid calendar dates, defaults to Europe/Madrid today, displays
  `dd/MM/yyyy`, and avoids timezone-induced day changes.
- DecimalInput accepts positive gross euros, minimum 0.01, at most two decimals.
  Do not apply clinic percentages or import activity/summary amounts.
- Fixed invoice IRPF is 15%, independent of activity settings. With decimal
  precision, round withholding half-up to cents, then subtract from gross.
  100 yields 15/85; 0.10 yields 0.02/0.08. Format Spanish euro amounts to two decimals.
- Define validation/output contracts for 05–06: missing/invalid fields blank,
  calculations depend on valid gross. Fixtures cover active/inactive clinics,
  no template, loading and failure, confined to development/test boundaries.
- Production interim state explains unavailable generation and disables download;
  no mock success, fake preview or fixture data enters production runtime.

## Validation

Run [application checks](readme.md#completion-and-validation), focused validation,
date, rounding and navigation tests. Live desktop/mobile checks cover all four
destinations, direct/auth/history navigation, keyboard order, monthly continuity
and production-safe interim state. Capture S05/Alexandria evidence, disclosing fixtures.

## Progress notes

Planning only; no checks performed. At intake inspect the actual shell and
Milestone 06 continuity policy rather than assuming tracking proves what is merged.
Human acceptance of this refined task is pending.
