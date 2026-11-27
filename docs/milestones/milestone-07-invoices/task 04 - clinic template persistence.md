# Task 04 — Clinic template persistence

Status: `in_progress`

## Objective

Connect the existing clinic form to the private template lifecycle delivered by
02 and the local file field/validation delivered by 03. Saving a clinic makes its
optional template usable after reload and in another session.

## Scope and exclusions

This is application integration, not another storage-design task. Reuse the
single private bucket, signed upload, authoritative validation, atomic clinic save,
recorded outcomes and affected-object cleanup already implemented in 02.

Keep one clinic form for create/edit and the existing clinic-deletion interaction.
No temporary bucket, promotion/copy, batch collector, scheduled/manual maintenance
process, new demonstration route, invoice generation or invoice history.

## Dependencies and established decisions

Tasks 02 and 03 are complete and merged. Their final decisions are authoritative:

- [Storage decision](template-storage-decision.md) and
  [operating guide](template-storage-runbook.md): one upload to a fresh UUID path,
  no overwrite, validate those same bytes, then atomically save the association.
- [Task 03](<task 03 - clinic template field and validation.md>): existing optional
  field, chooser/drop, staged intent, actual-byte local validation and rejection
  recovery. Local checks remain advisory; the server validates before publishing.
- Existing private read route verifies the current owner and association and
  streams `private, no-store` bytes. It is not a signed public download URL.
- Cleanup retries only the affected operation/object. Failed or abandoned bytes
  can remain private indefinitely without another attempt of that operation;
  there is no general collection process or idle-cleanup deadline.

Follow [template/saving rules](../../requirements.md#invoice-templates-and-generation),
[S02](../../screens.md#s02--clinics), [milestone sources](readme.md#source-references),
[database rules](../../../supabase/AGENTS.md) and existing continuity policy.
A new migration is not a prerequisite: first use the delivered contracts. If a
concrete acceptance failure requires changing them, document the smallest change
and obtain the required exact-target authorization before hosted application.

## Acceptance criteria

- Enable the real template field in clinic creation/editing. Show the saved
  filename separately from a selected local File. Selection alone never uploads;
  upload starts with Guardar. Same-file selection, discard and Cancel retain the
  behavior already verified in 03.
- Load owned clinic revision and current template metadata. Support optional
  templates on active and inactive clinics and ordinary no-template saves.
- Connect Guardar to the existing begin/upload/validate/commit flow. Verify the
  current session/owner on the server; do not trust browser PDF validation,
  claimed ownership or caller-supplied object paths. Reuse the five-text-field,
  encryption and inclusive 10,000,000-byte rules from 02–03.
- Save clinic fields and template association atomically. Upload, validation or
  commit failure preserves the saved pair and retains entered values for retry.
  Recover uncertain responses through the existing request outcome; retries do
  not create a second clinic or overwrite a concurrent winner. Never label a
  selected/staged file as saved.
- Cancel leaves the saved pair unchanged. Use the existing cancellation path for
  any upload actually started. Replacement/removal use the existing affected-file
  cleanup after commit; cleanup failure reports saved-with-cleanup-pending rather
  than total Save failure. Do not add a stronger cleanup guarantee than 02.
- Preserve existing clinic deletion and its linked-activity constraint. Rejected
  deletion preserves the template; successful deletion retires its association
  and rejects subsequent stale reads. Attempt only safe, owned, affected-object
  cleanup using the existing guard. Document any concurrency/retry retention
  limitation honestly; do not introduce a new cleanup subsystem to hide it.
- Invalidate clinic/template data after successful writes, including cross-tab
  notices, while preserving Activity/Summary invalidation. Invoice integration
  consumes that freshness contract in 06; no PDF engine or preview is added here.
- Keep draft File bytes and upload capabilities in memory within the existing
  session boundary. Never persist them in web storage or reconstruct a File from
  a filename/path. Restore only retained real bytes; request reselection when
  necessary. Sign-out/account change must discard private draft material.
- Other users and anonymous callers cannot read or mutate metadata/bytes.
  Assign/replace/remove persist after reload and another ordinary session.

## Validation

Run the [application checks](readme.md#completion-and-validation) and meaningful
integration tests. Verify production signed-in desktop/mobile create/edit,
Save/Cancel, assign/replace/remove, failure/retry, reload/two sessions, deletion
with/without activity, cross-tab freshness and session change. Reuse the existing
hosted lifecycle checks for trusted validation bypass, boundary size, owner
isolation, uncertain replies, conflicts and cleanup failures; extend only for
new integration risks. Record targeted fixture cleanup and policy limitations.

Use [synthetic sessions](../../supabase.md#local-signed-in-validation), actual
production routes and `chrome-screenshots` against S02/Alexandria. No replacement
catalogue harness. Independent review verifies the delivered application head and
applicable hosted behavior. Database checks apply if database assets change.

## Progress notes

2026-11-27: User assigned implementation under the project workflow. Intake and
initial form integration started, then paused while remaining tasks were
reconciled with final decisions from 02–03. The user accepted the rewritten
definitions on 2026-11-27; task 04 implementation has resumed.
No new migration or hosted configuration has been applied.

This definition supersedes the earlier architecture-neutral planning text. It
keeps the invoice business requirements and reuses the completed infrastructure;
it does not reopen the storage decision or promise general orphan collection.

## Execution context

- Assignment: user authorized task 04 under the project workflow on 2026-11-27.
  The user accepted the reconciled task definitions on 2026-11-27 and authorized
  task 04 execution to resume within those criteria.
- Readiness: dependencies 02 and 03 are merged into updated `develop`;
  branch `feature/clinic-template-persistence`, base
  `d474ae697ecfeea2fc887e70943e05cc823849f6`. Checkout was clean.
- Native implementer/reviewer roles are available in the active session.
  Implementation and independent review run sequentially, with one writer.
- Sources: requirements invoice/saving rules, architecture, S02 and Alexandria,
  `template-storage-decision.md`, `template-storage-runbook.md`, database rules,
  and `docs/supabase.md#local-signed-in-validation`.
- Verified: ordinary implementer/reviewer fixture accounts can authenticate and
  read their active owned synthetic clinics on `lvqbrjybwstvdhaxyxyn`.
  Server template configuration and isolated headless Chrome are available.
  Use ignored fixture settings directly; never publish credentials.
- Relevant implementation: `src/lib/templates/infrastructure.ts` and `server.ts`,
  clinic form/field, list and create/update/delete actions, continuity drafts,
  and signed-in data invalidation. Existing clinic reads omit template/revision
  metadata, and the form's template field remains an interim local integration.
- Constraints: preserve the reviewed single-bucket lifecycle and authoritative
  validation; retain legacy no-template behavior and activity constraints.
  No invoice generation, public deployment, scans, or unrelated changes.
  Synthetic fixture writes/cleanup follow the documented procedure. Any new
  migration or hosted configuration change requires exact-target authorization.
- Validation: lint, typecheck, format:check, build, meaningful focused tests;
  desktop/mobile signed-in checks and independent hosted verification at head.
  Exercise boundary failures, retries, concurrency, two sessions and isolation.
  Database changes additionally require the documented hosted checks.
- Environment: network/Git operations require sandbox escalation; verified GitHub
  authentication and pinned pnpm 11.25.0 work through that mechanism. Node hosted
  requests need system CA trust; keep TLS verification enabled.
- Reconciliation: prior task 02 decisions govern cleanup/retention. The initial
  deletion investigation found that the existing RPC does not return a retired
  template UUID; this does not itself authorize a new ledger, cleanup guarantee
  or migration. Verify integration against the existing policy and disclose limits.
- Open product questions: none. Rewritten definitions accepted; execution resumes
  on the existing assignment branch with the same implementer/reviewer.
- Automatic correction rounds used: 0 of 2.

2026-11-27: Intake passed and task/index moved to `in_progress`. Implementation,
required checks and independent review remain pending.
