# Task 04 — Configure coordinator

Status: `in_progress`

## Objective

Configure the primary Codex agent to prepare assignments and coordinate separate
implementer and reviewer agents under the revised three-role workflow.

## Scope

- Update the approved contract and task definitions for the user-approved role
  split, preserving existing task identifiers and Task 00 acceptance history.
- Activate the coordinator through repository `AGENTS.md` and focused role
  instructions, with no user-wide configuration changes.
- Cover readiness, branch setup, task creation/enrichment, sourced execution
  context, delegation, tracking, bounded corrections, and final PR delivery.
- Verify loading and exercise readiness and delivery decisions without changing
  product behavior. Record actual validation and limitations.

## Dependencies

Task 00 is complete. The user approved three roles and requested coordinator
configuration on 2026-10-28. Task 04 precedes Tasks 01 and 02 despite its identifier,
which preserves existing task references.

## Acceptance criteria

- The primary agent loads the coordinator entry instruction and reads its role.
- Ready assignments lead to branch/task preparation and implementation handoff;
  missing product decisions lead to a concrete user question before dispatch.
- Additional context preserves approved scope and distinguishes sources, verified
  facts, and hypotheses. Delegated agents retain separate responsibilities.
- Two correction rounds follow initial review; the final review triggers delivery
  or escalation, never a third automatic correction.
- Optional improvements wait for final human PR review. The coordinator manages
  delivery and never merges the PR.
- Documentation, dependencies, task status, and milestone index are consistent.

## Validation

Inspect instruction discovery in a fresh Codex CLI run from the repository root.
Exercise the role read-only with ready, missing-decision, optional-suggestion, and
round-limit scenarios. Distinguish simulated decisions from executed Git/PR actions.
Run formatting and local-link checks and independent bootstrap configuration review.
Full delegated role loading and the real workflow exercise remain Tasks 01–03.

## Execution context

- Readiness: user approved documentation changes and coordinator configuration.
- Branch: `feature/configure-coordinator`, created from updated `origin/develop`.
- Base commit: `d995bd57737b93db071ec9fe52ebea6553f607c1`.
- Role: [coordinator](../../agents/coordinator.md); source of workflow rules:
  [contract](../../development-workflow.md).
- Verified finding: installed Codex CLI exposes `debug prompt-input` and discovers
  repository `AGENTS.md` when launched from the repository root.
- Constraint: native implementer/reviewer definitions are not configured yet.
- Correction rounds used: 0.

## Progress notes

- 2026-10-28: started coordinator configuration and updated the three-role contract.
- Task 00 remains complete; this task records the subsequent approved change.
- Fresh CLI instruction discovery passed for the repository marker, coordinator
  activation, and role reference. A fresh ephemeral read-only run completed with
  exit code 0 and returned the expected decisions for all four scenarios and the
  correct role responsibilities. These were simulations, not live assignments.
- Independent bootstrap review found no content blockers and one optional wording
  suggestion, deferred to human PR review. Correction rounds used: 0.
- [Validation evidence and limitations](coordinator-validation.md) record commands,
  scenario outcomes, independent review, and non-blocking CLI app-handshake warnings.
- Validation passed: Prettier across all changed documentation and milestone files,
  53 local Markdown links with referenced heading anchors, and `git diff --check`.
  Application checks are not applicable to this configuration/documentation change.
- Delivery remains subject to human review and manual merge into `develop`.
- Delivery: [PR #1](https://github.com/manromero/my-clinics/pull/1), targeting
  `develop`. Remains `in_progress` while human review and manual merge are pending.
