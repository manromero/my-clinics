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
| [02 — Private template analysis and infrastructure](<task 02 - private template infrastructure.md>) | `in_progress` | Existing clinics/authentication; independent of 01                                 |
| [03 — Clinic template field and validation](<task 03 - clinic template field and validation.md>)    | `pending`     | 00 and independently reviewed 02 analysis/design contract, not hosted availability |
| [04 — Clinic template persistence](<task 04 - clinic template persistence.md>)                      | `pending`     | 02 and 03                                                                          |
| [05 — PDF fill and flatten engine](<task 05 - pdf fill and flatten engine.md>)                      | `pending`     | 01 validation contracts; 03 library/validator/fixtures                             |
| [06 — Live preview and download integration](<task 06 - live preview and download integration.md>)  | `pending`     | 01, 04 and 05                                                                      |

Recommended order is numeric, 00 through 06. The table gives direct prerequisites,
not blanket dependencies on every earlier task. Task 02 requires investigation,
independent challenge of its evidence/choice before configuration, and selected
infrastructure implementation. Its future versioned `template-storage-decision.md`
records alternatives, evidence, rationale, risks and test results; no approach is
preselected. Task 03 can use the independently reviewed analysis/design contract
while hosted execution is blocked; both phases are required to finish 02 and 04/06
cannot claim persistence without verified hosted setup.

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

2026-11-26: Task 02 is `done` in [PR #72](https://github.com/manromero/my-clinics/pull/72).
Both phases, the explicitly authorized development rollout and independent review
passed with no blockers. The migration, private buckets and local server secret
are configured; 17 development acceptance checks passed and all original data
digests are preserved. Development is healthy and all disposable projects are
deleted. Correction rounds used: 1 of 2. Four private fixture objects remain within
normal retention; the runbook/PR records deadlines and daily manual cleanup.
Final tracking is included for review. Human acceptance and manual merge remain
pending; tasks 03–06 remain pending.

2026-11-26: Task 02 technical and documentation review passed after correction 1.
Development is restored and all four services are `ACTIVE_HEALTHY`. Read-only
history confirms the template migration is still absent. PR #72 stays draft and
task 02 stays `in_progress` pending explicit persistent rollout authorization,
application and verification. No disposable project remains.

2026-11-26: Task 02 correction 1 passed independent technical review at `402bf77`:
B1 is fixed by a file-scoped signed resumable upload capability, with no account
credential returned. Required checks, 383 unit tests, affected hosted validation
and independent scope/Cancel/expiry probes passed. No code blockers remain; one
automatic correction round was used. [PR #72](https://github.com/manromero/my-clinics/pull/72)
stays draft and task 02 stays `in_progress` pending separate authorization and
execution of the reviewed persistent development rollout. All disposable targets
are deleted; development restoration was requested. Human acceptance and manual
merge remain pending.

2026-11-26: Task 02 implementation and required validation passed, but the initial
independent phase 2 review of [PR #72](https://github.com/manromero/my-clinics/pull/72)
found blocking B1 in the browser upload credential scope. Correction round 1 of 2
is assigned. Other independent checks passed, including the fresh hosted lifecycle
suite and 383 unit tests. The task remains `in_progress`; deployment authorization
and human acceptance remain pending.

2026-11-26: Task 02 phase 1 investigation and independent decision review passed
at `67fd610d804b1f453e385aa7801603c29d250996`, with no blockers and one optional
research diagnostic suggestion. Actual hosted transfer/access/cache proofs and
the downstream contract are documented in `template-storage-decision.md`. All
research targets were deleted and development restored. Phase 2 implementation,
validation, final review and separate rollout authorization remain outstanding;
task 02 stays `in_progress`, correction count 0 of 2.

2026-11-26: Task 02 is `in_progress` after the user authorized pausing development
for disposable capacity and restoring it after testing. The verified development
pause request succeeded; phase 1 investigation and independent decision review must
precede infrastructure implementation. Persistent development rollout remains a
separate concrete authorization after review.

2026-11-26: The user authorized the task 02 disposable project. Supabase rejected
the actual creation attempt with HTTP 400 `free_project_limit` because the account
owner already has two active Free projects across organizations. No project was
created or changed. Task 02 remains `pending` at intake until capacity is resolved;
the earlier pending disposable authorization is superseded.

2026-11-26: Task 02 was assigned but remains `pending` at blocked intake. Read-only
inspection verified that the Free validation organization has two active projects;
the validation runner requires a free slot. Task-specific disposable Storage/Auth/API
probe authorization and a capacity solution are pending. Shared-development rollout
requires separate authorization after decision review. No implementation branch or
hosted writes were made. See task 02 for the intake record.

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

2026-11-26: User required deeper independent analysis in 02 before choosing and
configuring infrastructure. Earlier suggestions remain hypotheses, not approved
architecture. All statuses remain pending; this clarification performs no research.
