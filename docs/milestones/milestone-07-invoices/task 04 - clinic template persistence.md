# Task 04 — Clinic template persistence

Status: `pending`

## Objective

Connect explicit clinic Save/Cancel to private validated templates, preserving
clinic values and the previously saved usable file on failure.

## Scope and exclusions

Enable real create/edit template mutations, integrate existing clinic deletion and
freshness notifications. No invoice generation/history or broad destructive cleanup.

## Dependencies

02 and 03, including hosted configuration and verified transfer contracts. Follow
[saving](../../requirements.md#saving-and-date-defaults),
[template rules](../../requirements.md#invoice-templates-and-generation),
[database rules](../../../supabase/AGENTS.md) and [milestone sources](readme.md#source-references).
Exact target/migration authorization remains necessary for remote changes.

## Acceptance criteria

- Verify owner session, clinic ownership and authoritative PDF bytes on the trusted
  boundary even when browser validation is bypassed. Enforce the same five text
  fields, encryption rules and agreed 10 MB byte limit.
- Guardar saves name, percentage, active state and optional template coherently.
  Cancel/failed Save preserve previous saved clinic values, association and file;
  retain entered retry values with errors. No silent partial writes or staged files
  labeled saved.
- Storage/database operations are not assumed transactional together. Implement the
  lifecycle and failure-coherence mechanism chosen through 02's investigation and
  independent decision review, including scoped recovery/cleanup as applicable.
  Preserve the previous usable file until replacement/removal is successfully
  saved. Staging/immutable objects are options, not a predetermined architecture.
- Postcommit cleanup failure is recovery work, not false total Save failure.
  Idempotent retries and concurrent saves cannot delete a later save's current
  object. Demonstrate failures at upload, validation, commit and deletion boundaries.
- Assign/replace/remove persist after reload and across two sessions. Integrate
  current delete-clinic lifecycle without breaking its linked-activity constraint;
  rejected deletion preserves template. Prevent stale references and clean only
  owned, unreferenced objects under the documented recovery policy.
- Invalidate clinic/invoice template versions and caches including cross-tab
  updates. Preserve existing activity/summary invalidation.
- Respect Milestone 06 continuity: no File bytes in persistent web storage, no
  filename/path restored as a selected File. Restore only real retained in-memory
  bytes; request reselection if they are lost.
- Other users/anonymous callers cannot read or mutate metadata/bytes. Both active
  and inactive owned clinics support templates; no-template workflows still work.

## Validation

Run applicable [application/database checks](readme.md#completion-and-validation).
Use authorized synthetic targets for desktop/mobile Save/Cancel, failure/retry,
replace/remove, blocked/successful deletion, reload/two sessions, owner isolation,
boundary transfer and browser-validation bypass. Meaningfully test concurrency,
compensation and cleanup failure, record actual cleanup/results, and capture clinic
UI against S02/Alexandria with `chrome-screenshots`. Independent review must verify
hosted behavior at the delivered head.

## Progress notes

Planning only; no storage writes or save behavior implemented/validated. Human
acceptance of this refined task is pending.

2026-11-26: Aligned with independent architecture selection in 02; Save/Cancel,
failure, concurrency and preservation requirements remain unchanged.
