# Task 03 — Clinic template field and validation

Status: `in_progress`

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

2026-11-27: The user assigned task 03 under the project workflow, authorizing its existing scope. Implementation and independent review are pending. Human acceptance and manual merge remain separate.

## Execution context

- Readiness: ready. Tasks 00 and 02 are integrated in the updated development baseline. No product decisions remain open.
- Branch: `feature/clinic-template-validation`; base: `f58c9e6df188e913f366b91a97845b6c02c8672a` (`develop`). The initial working tree was clean.
- Scope remains the approved criteria above: local validation and staged intent only; production template mutation stays unavailable until task 04. No hosted infrastructure or schema changes are authorized by this task.
- Relevant implementation: `src/app/(signed-in)/clinics/clinic-form.tsx`, clinic create/edit callers and tests; shared FileInput and its catalogue; `src/lib/templates/pdf-validation.ts` and tests; template infrastructure/server boundaries.
- Verified baseline: `pdf-lib` 1.17.1 is installed and pinned. The existing authoritative validator uses a bounded Node worker and SHA-256, rejects encryption and requires the five text fields. Its server-only imports cannot enter the browser bundle. Reuse contracts where appropriate and retain authoritative resource bounds. Browser validation/library suitability and fill/flatten appearance still require capability evidence; these are not assumed passes.
- Contract: `template-storage-decision.md` sets an inclusive maximum of 10,000,000 bytes. Selection never uploads, and stored descriptors must remain distinct from Files. Both chooser and drop use the same validation.
- References: requirements invoice templates/generation; screens S02 and shared interaction rules; Alexandria; supplied S02 HTML/image (HTML duplicates S05, so preserve assets and follow current clinic UI/text); architecture and development workflow. Read installed Next.js client-boundary and route/proxy guides relevant to implementation.
- Validation: lint, typecheck, format:check, build, meaningful actual-byte validator/race tests, and live desktop/mobile harness plus production create/edit checks. Use chrome-screenshots and github-pr for evidence and publication. Catalogue/demo checks remain live, not specimen unit tests.
- Synthetic access verified independently for implementer and reviewer with `scripts/agent-validation.mjs` and isolated headless Chrome. Follow `docs/supabase.md#local-signed-in-validation`; read ignored credentials directly without printing them. This workstation requires `NODE_USE_SYSTEM_CA=1` for trusted TLS; do not disable certificate verification. Use fresh role sessions for actual checks and keep DevTools loopback-only.
- Tooling: pnpm 11.25.0 verified; Chrome is installed. Network/Git writes may require the normal tool approval path. No credentials belong in task notes, PRs, evidence or browser scripts.
- Correction rounds used: 1 of 2; B1 fixed and independently verified on `d1922db45d89fd96576bdcc27e05ebb3beab3ed6`.

### Initial implementation and independent review

Implementation: [PR #73](https://github.com/manromero/my-clinics/pull/73), head `1a988432ae180f30ebd4f8d72e3dde742d28f70c`, base `f58c9e6df188e913f366b91a97845b6c02c8672a`. Both roles independently passed lint, typecheck, formatting, build and all 392 tests. Independent desktop/mobile and signed-in production checks covered validation, boundary, staging, retry and the disabled production field. Eleven inline PR images were published and verified. Detailed evidence and limitations belong to the PR.

Initial independent review: blocked by B1. Selecting the first corrupt PDF with no accepted template leaves a blocking error with no clear/remove recovery; Save cannot continue without a valid PDF or canceling all clinic inputs. The same problem can follow pending removal. Correction round 1 requires explicit discard/clear recovery preserving clinic inputs and pending intent, clearing the error, allowing no-template save, and invalidating stale asynchronous validation. B1 was open at this initial review; the correction outcome is recorded below.

Optional observations: existing Next.js advisory remains separate follow-up scope. Local parsing has no browser worker/resource bounds (production editing remains disabled). Native OS picker UI was not exercised; browser automation verified file delivery and drop. Human acceptance and manual merge remain pending.

### Correction and ready delivery

Correction round 1: `d1922db45d89fd96576bdcc27e05ebb3beab3ed6` adds explicit rejected-file discard recovery, retains clinic inputs and keep/remove intent, restores chooser focus and suppresses stale results. The same independent reviewer verified B1 as fixed in fresh desktop and 390 × 844 touch-emulated sessions. Both recovery/save flows, keyboard activation, focus, additional invalid-file cases, replacement preservation and no selection uploads passed. Production disabled-field, ordinary clinic save and production harness 404 regression checks also passed. No open blocking findings remain.

Both roles passed `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and all 395 tests across 48 files at the corrected implementation head. Independent visual inspection of refreshed desktop/mobile captures found no visual blocker. The PR preserves initial review history and eight refreshed correction images in addition to eleven original images; the implementer verified remote PNG content, dimensions, hashes and rendered attachments.

Task and milestone index are `done` for agent delivery in [PR #73](https://github.com/manromero/my-clinics/pull/73). This tracking-only update is included in the same PR for final documentation review. Human acceptance and manual merge into `develop` remain pending. Production template editing remains explicitly unavailable until task 04; no template upload or persistence was implemented. Detailed evidence, optional observations and practical limits are retained in the PR.

### User-requested catalogue removal

2026-11-27: The user requested removal of `/components/clinic-template` from PR #73, consistent with task 01 catalogue cleanup. Reopened for this scoped change and independent review. Remove the development page and specimen; retain the route-local actual ClinicForm, field, PDF contracts/fixtures and meaningful tests. No new public demonstration route replaces it. Earlier harness captures remain historical evidence, not current route availability. Verify the removed route returns 404 in development, the shared catalogue and FileInput page remain usable, and the production build excludes the removed route. Required application checks and affected tests apply. Existing correction count remains 1 of 2; this user-requested change does not reset it. Continue on the same assignment branch and PR; no new branch is needed.
