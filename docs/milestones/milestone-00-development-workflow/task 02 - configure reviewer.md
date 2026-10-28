# Task 02 — Configure reviewer

Status: `done`

## Objective

Configure a separate reviewer role covering code, functional behavior, and visual
quality using the validated contract from [Task 00](<task 00 - define workflow.md>).

## Scope

- Create the role instructions and configuration agreed in Task 00.
- Review the current PR changes against the task and its acceptance criteria.
- Review code correctness, maintainability, project conventions, and relevant
  automated checks.
- Check functional behavior and applicable boundary, empty, and error cases.
- For UI changes, compare the running result with Alexandria and the relevant
  Stitch references on desktop and mobile; record visual evidence and gaps.
- Classify findings as blocking problems or optional improvements, with location,
  impact, and evidence. Recheck fixes and report any remaining limitations.
- Return findings and reviewed commit to the coordinator, which routes corrections
  and manages final delivery. Optional suggestions never interrupt the workflow.

## Dependencies

Task 00 is complete, the three-role revision is approved, and
[Task 04 — Configure coordinator](<task 04 - configure coordinator.md>) is complete.

## Acceptance criteria

- The reviewer is a separate agent from the implementer.
- The reviewer receives assignments from the coordinator and reports evidence
  back to it without editing product files or starting corrections itself.
- All three review perspectives are addressed, with non-applicable checks
  explicitly explained.
- The reviewer verifies evidence instead of relying only on the implementer's
  assertions. Unperformed checks cannot be reported as passing.
- Findings identify a concrete problem and a way to verify its correction.
- Optional suggestions do not become requirements without user validation.
- The agreed correction-round limit is respected. The reviewer never merges.

## Validation

Verify configuration loading and exercise review against agreed sample changes,
including a known blocker and an optional improvement. Check that the reviewer
distinguishes them and rechecks a correction. Validate links and formatting.

## Progress notes

Started after coordinator readiness checks and verification of Task 01's merge.

- A fresh native implementer created the definition and fixture. Its sandbox
  rejected native-path writes; the coordinator installed the exact staged TOML
  through approved escalation and verified its SHA-256. The duplicate was removed.
- Native discovery and actual native reviewer launch succeeded. One fresh reviewer
  independently reproduced the initial blocker, rechecked the corrected artifact,
  separated optional feedback, explained visual N/A, and respected both policy
  simulations. The same reviewer was retained throughout this task's handoffs.
- [Validation evidence](reviewer-validation.md) records commands, native role and
  session receipts, results, limitations, and the distinction between fixture
  scenarios and actual implementation correction rounds (0).
- Changed-file formatting, installed TOML parsing, ESLint, and 76 local Markdown
  links/heading anchors passed. Global formatting still reports five unchanged
  visual references; they are outside this task and were preserved.
- Independent bootstrap configuration review found no blockers after verifying
  the native receipts and directly checking the definition and fixtures. The
  native final-review continuation was interrupted by CLI quota before a verdict;
  it is not represented as a passing native review.
- Delivery: [PR #3](https://github.com/manromero/my-clinics/pull/3), targeting
  `develop`. Agent work is complete; human approval and manual merge remain pending
  in GitHub. The `done` update is included in final tracking review and this PR.
- Implementation correction rounds used: 0. The coordinator repaired the staging
  link and evidence wording before the first completed configuration review;
  fixture transitions were simulations, not implementation correction rounds.

## Execution context

- Readiness: the user assigned Task 02; scope and acceptance criteria are defined.
  Tasks 00/04 are complete, and PR #2 was verified merged into `develop`.
- Branch: `feature/configure-reviewer`, from updated `origin/develop`.
- Base commit: `b1c474d14758afcf1565304dde1afdc234e3ed7c`.
- References: `AGENTS.md`, workflow contract, coordinator role, native implementer,
  and official Codex custom-agent documentation.
- Target: native `.codex/agents/reviewer.toml`, inherited settings, three review
  perspectives, concrete blocking/optional findings, current-head evidence, and
  coordinator handoff without edits, merge, or automatic third correction.
- Include fresh agents with selected context per task; retain those agents for
  that task's correction/review rounds. Do not inherit unrelated conversation.
- Validation: native discovery/launch and a bounded fixture with a known blocker,
  optional finding, and corrected version; check missing evidence and round limits.
  Fixtures are outside production routes. No product/UI changes are assigned.
- Tracking: coordinator owns task/index; `done` is included in final reviewed PR
  before human acceptance. Correction rounds used: 0.
