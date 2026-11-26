# Task 01 — Invoice route and form contracts

Status: `in_progress`

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

2026-11-26: Reopened after the user requested removal of the full invoice form
from the component catalogue. Remove `/components/invoices` and its specimen;
retain the route-local form and existing test-only scenarios. Update PR #71 in
place, preserving earlier review and evidence as historical. This user-requested
change awaits implementation checks and independent re-review. No automatic
correction rounds have been consumed (0 of 2).

2026-11-26: The user assigned this task under the project workflow, authorizing
its existing scope for implementation.

[PR #71](https://github.com/manromero/my-clinics/pull/71) adds authenticated
invoice navigation, the route-local form and exact validation/calculation/output
contracts. Production explains that clinic/template selection and PDF generation
are unavailable; download remains disabled. Development-only specimens cover the
fixture states. Actual clinic/template integration remains in task 06.

Independent review of `b1fa1598eb50f48b9348c9b88832b1523676c39f` against the
recorded base found no blocking defects. Both agents passed
lint, type checking, formatting, the production build and 124 focused tests. Each
verified navigation, auth/history, monthly/clinic continuity, inputs, rounding,
production boundaries and development fixture states with its own browser session.
Desktop and narrow responsive captures were inspected against S05/Alexandria;
four inline PR images were retrieved and verified. Detailed results and evidence
are in the PR. Correction rounds used: 0 of 2.

Both agents observed the existing Next.js 16.4.3 security advisory stop an initial
build; unchanged retries completed successfully. A dependency upgrade is an
optional separate follow-up, as is widening the desktop catalogue specimen.
Narrow Chrome viewports were tested without touch emulation. Google OAuth was
unchanged and its provider flow was not revalidated. The rendered GitHub PR page
was not inspected; the attached image artifacts were verified directly.

Required implementation checks and independent review are complete. The final
tracking-only update is included in the same PR for administrative re-review.
Human acceptance and manual merge remain pending.

## Execution context

- Readiness: approved objective and criteria are actionable. Both dedicated
  synthetic accounts signed in and displayed Activity in isolated headless Chrome.
  No database, template infrastructure or PDF-generation work is authorized here.
- Branch: `feature/invoice-route-form-contracts`, based on updated `origin/develop`
  at `e2dc1f3f7a6776efdab1f5157accab54ee2c992e`. The initial checkout was clean.
- Sources: the requirements, S05 and milestone references above, plus
  [architecture](../../architecture.md),
  [Alexandria](../../screens/alexandria/DESIGN.md), and installed Next.js
  `layouts-and-pages` and `linking-and-navigating` guides. Read the relevant
  installed guides before application edits.
- Verified: `SignedInShell` currently recognizes Clinics, Activity and Summary.
  It retains the last monthly query while visiting non-monthly routes;
  `MainNavigation` defines destination types/order. Preserve that continuity and
  Activity landing behavior while adding Invoices to the real route contracts.
- Inspect signed-in history guards, Proxy/auth destinations, existing shared
  controls and route tests; do not assume adding a navigation label is sufficient.
  Reuse the actual controls and keep invoice-only helpers beside their route.
- Validation: run lint, type checking, formatting, production build and meaningful
  focused tests for validation, decimal rounding, dates and navigation. Follow the
  [local signed-in procedure](../../supabase.md#local-signed-in-validation) with
  each role's own fixture; check all four destinations and history on desktop and
  mobile. Both the launcher and server required `NODE_USE_SYSTEM_CA=1` for the
  installed trusted certificates. Do not expose fixture values in evidence.
- Use `chrome-screenshots` for independent captures/inspection and `github-pr`
  for publication with verified inline attachments. Confine explicit fixture
  scenarios to development/test boundaries; production must explain unavailable
  generation and never display a mock PDF or successful download.
- Hypothesis to verify: retaining the shared shell's monthly state through
  Invoice visits can preserve existing month/clinic selection without adding
  invoice persistence or importing monthly amounts.
- Open product questions: none. Correction rounds used: 0 of 2.
