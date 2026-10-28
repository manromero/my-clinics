# Task 02 — Configure reviewer

Status: `pending`

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

Not started. Task 00 is accepted; awaiting Task 04 under the approved three-role
revision. Configure independent review with handoff through the coordinator.
