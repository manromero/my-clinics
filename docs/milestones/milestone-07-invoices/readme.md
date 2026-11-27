# Milestone 07 — Invoices

## Objective

Generate and download invoices from private clinic PDF templates, with live
preview and the fixed 15% invoice withholding rule. Add a reusable FileInput
supporting native selection and drag and drop simultaneously.

This proposed breakdown documents the confirmed invoice feature and accepted
file-selection behavior. Human acceptance of the refined plan is pending.
Planning does not start implementation or authorize hosted writes.

## Scope and submilestones

1. **Inputs and contracts (00–01):** generic FileInput/catalogue, authenticated
   invoice route/navigation, validation and calculations.
2. **Private templates (02–04):** independent evidence-based Storage/metadata
   investigation and decision review, selected infrastructure configuration, local
   clinic PDF field/validation, then coherent clinic/template persistence.
3. **PDF output (05–06):** independently tested fill/flatten engine, then real data,
   actual live PDF rendering and fresh download integrated end to end.

Only FileInput becomes a new shared UI component. Keep the template field and PDF
preview route-local; move domain helpers to `src/lib` only for actual shared usage.
Reuse existing controls and the single ClinicForm. Exclude invoice history/records,
annual lists, archives, activity import, accountant registration, editable concept/
billing/bank fields, numbering/check-duplicates, fiscal/PDF-A claims, activity or
settings changes, and public deployment. Export extras do not extend scope.

## Task index and direct dependencies

| Task                                                                                                | Status        | Direct dependencies                                                                |
| --------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------- |
| [00 — FileInput and catalogue](<task 00 - file input and catalogue.md>)                             | `done`        | Existing controls; independent                                                     |
| [01 — Invoice route and form contracts](<task 01 - invoice route and form contracts.md>)            | `done`        | Existing controls/authenticated shell; independent of 00                           |
| [02 — Private template analysis and infrastructure](<task 02 - private template infrastructure.md>) | `done`        | Existing clinics/authentication; independent of 01                                 |
| [03 — Clinic template field and validation](<task 03 - clinic template field and validation.md>)    | `done`        | 00 and independently reviewed 02 analysis/design contract, not hosted availability |
| [04 — Clinic template persistence](<task 04 - clinic template persistence.md>)                      | `in_progress` | 02 and 03                                                                          |
| [05 — PDF fill and flatten engine](<task 05 - pdf fill and flatten engine.md>)                      | `pending`     | 01 validation contracts; 03 library/validator/fixtures                             |
| [06 — Live preview and download integration](<task 06 - live preview and download integration.md>)  | `pending`     | 01, 04 and 05                                                                      |

Recommended order is numeric, 00 through 06. The table gives direct prerequisites,
not blanket dependencies on every earlier task. Task 02 records the final storage
conclusions and contract in `template-storage-decision.md`; hosted development
setup and independent verification are complete. Task 03 uses that reviewed
contract; task 04 also requires the clinic field from task 03.

## Source references

- [Invoice requirements](../../requirements.md#invoice-templates-and-generation),
  [currency/rounding](../../requirements.md#currency-and-rounding),
  [access/devices](../../requirements.md#access-and-devices), and
  [saving](../../requirements.md#saving-and-date-defaults).
- [S02 Clinics](../../screens.md#s02--clinics), [S05 Invoices](../../screens.md#s05--invoices),
  [shared interactions](../../screens.md#shared-interaction-rules), and
  [visual references](../../screens.md#visual-design-references).
- [Alexandria](../../screens/alexandria/DESIGN.md), S02
  [HTML](../../screens/s02_gesti_n_de_cl_nicas/code.html)/[image](../../screens/s02_gesti_n_de_cl_nicas/screen.png),
  S05 [HTML](../../screens/s05_facturas/code.html)/[image](../../screens/s05_facturas/screen.png).
- [Architecture](../../architecture.md), [workflow](../../development-workflow.md),
  [database rules](../../../supabase/AGENTS.md), [Supabase guide](../../supabase.md).

S02 HTML currently duplicates S05. Preserve supplied assets and use the existing
clinic UI and functional S02 text; this known mismatch does not block planning.

## Completion and validation

All seven tasks require their acceptance criteria, checks and independent review
under the standard workflow; human approval/manual merge remain separate. At
implementation intake inspect the actual baseline, read relevant installed guides
in `node_modules/next/dist/docs/`, and verify library/API/configuration capabilities
against official documentation. Record sources rather than assuming capabilities.

Application tasks run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build`
and focused meaningful tests. Validate catalogue specimens live, not with specimen
unit tests. UI implementers/reviewers use `chrome-screenshots` for desktop/mobile
capture, inspection and source attribution; implementers use `github-pr` for
authorized PR delivery and verified inline evidence. Screenshots do not substitute
for chooser/drop, keyboard, retry or race checks. Use the
[signed-in synthetic procedure](../../supabase.md#local-signed-in-validation).

Database tasks run `pnpm db:types`, `pnpm db:validate`, and `pnpm db:test-tooling`
if the harness changes, plus actual Storage API checks on an explicitly authorized
synthetic target. Existing public-only catalog coverage does not prove Storage
configuration; 02 extends applicable coverage and states its limits. Local files
alone do not finish hosted setup. Exact target/migration authorization is required;
this plan grants none. Record commands, head, target and actual results; unavailable
checks remain blockers rather than inferred passes.

## Progress notes

2026-11-27: Task 02 is `done` in [PR #72](https://github.com/manromero/my-clinics/pull/72).
The simplified one-bucket implementation and development correction passed
independent review. All original clinic/activity/owner data is preserved; no
fixture PDFs remain. Checks, 389 tests and 13 development business cases passed.
Only final conclusions and operating instructions remain. One automatic correction
round was used; human acceptance and manual merge remain pending.

2026-11-26: Task 01 is complete after the user-requested removal of the invoice-form
catalogue specimen in PR #71. The route-local form and tests are unchanged.
Required checks, 41 invoice tests and independent re-review passed; the removed
development route returns 404 and the catalogue still works. Earlier evidence is
retained as history and removed-specimen captures are superseded. O1 catalogue
width is retired; O2 Next.js advisory remains separate follow-up scope. Automatic
correction rounds used remain 0 of 2. Final tracking is included for review;
human acceptance and manual merge remain pending.

2026-11-26: Task 01 is complete in
[PR #71](https://github.com/manromero/my-clinics/pull/71). Required checks,
124 focused tests and independent desktop/mobile review passed with no blockers;
no correction rounds were needed. Production keeps PDF generation unavailable;
the actual clinic/template integration belongs to task 06. Four inline captures
are verified. The existing Next.js security advisory and catalogue specimen width
remain optional follow-ups. The tracking update is included for final review;
human acceptance and manual merge remain pending. Tasks 02–06 remain pending.

2026-11-26: The user assigned task 00 for implementation under the project
workflow. Its existing scope is approved for execution; other tasks remain pending.

Task 00 is complete in [PR #70](https://github.com/manromero/my-clinics/pull/70).
Required checks and independent review pass with no product defects or open
blockers. Reference HTML formatting was normalized with authorized project
Prettier 3.9.10. Implementer and reviewer verified browser-generated trusted
chooser cancellation in headless Chrome, retaining local and saved selections;
visible OS dialogs remain untested under the user's headless-only constraint.
Correction rounds used: 2 of 2. Task 00 is `done`; final tracking review, human
acceptance and manual merge are recorded in the PR. Other tasks remain pending.

2026-11-25: Prepared for direct documentation delivery, human acceptance pending.
All implementation tasks remain pending. No implementation, hosted operations,
branch, PR or application validation is claimed.

2026-11-27: Task 03 assigned for implementation under the project workflow; its existing scope is authorized. Local template validation and safe production interim form are in progress.

2026-11-27: Task 03 is `done` in [PR #73](https://github.com/manromero/my-clinics/pull/73). Local PDF validation, staged template intent and the safe disabled production field passed required checks, all 395 tests and independent desktop/mobile review. B1 rejected-file recovery was corrected and independently verified in one automatic correction round. Final tracking is included for review; human acceptance and manual merge remain pending. Tasks 04–06 remain pending.

2026-11-27: Task 03 reopened for the user-requested removal of its development catalogue page from PR #73. Existing form, validator and tests remain in scope; correction count remains 1 of 2.

2026-11-27: User-requested task 03 catalogue removal completed in PR #73 at `45dab5430978d5cddfbc4b01aa23e0f195f38739`. Both roles passed required checks, 17 affected tests and live route checks (removed page 404; common catalogue/FileInput 200). Independent review found no blockers; task 03 is `done` again. Historical harness captures are superseded. Correction count remains 1 of 2; human acceptance and manual merge remain pending.

2026-11-27: At the user's request, tasks 04–06 were reconciled with final decisions
and delivered code from 01–03. Remaining work is clinic-form persistence
integration, a small fill/flatten engine, and real preview/download integration.
The single-bucket architecture and affected-operation cleanup policy are settled;
removed demonstration routes stay removed. Task 04 implementation is paused for
acceptance of the rewritten definitions; 05–06 remain pending. No new migration
or hosted configuration has been applied as part of this reconciliation.

2026-11-27: User accepted the reconciled definitions of tasks 04–06. Task 04
implementation resumes on the existing branch; tasks 05–06 remain pending.
