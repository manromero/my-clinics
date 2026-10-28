# Task 03 — Validate workflow

Status: `pending`

## Objective

Demonstrate that the configured roles can carry a user-assigned task through the
agreed workflow to a reviewable PR and manual user merge.

## Scope

- Use the representative task or exercise validated in Task 00.
- Exercise assignment, implementation, required checks, PR creation targeting
  `develop`, and separate review.
- Demonstrate a blocking finding, a correction, and revalidation; use an exercise
  fixture rather than introducing defects into product changes.
- Demonstrate scope-question escalation and bounded correction rounds.
- Verify task statuses and the milestone index track the actual work.
- Record evidence, limitations, and final user handoff; wait for the user's PR
  review and manual merge.
- Before final delivery, move the representative exercise, desk walkthrough, and
  temporary setup notes from the operational contract into milestone historical
  records, preserving evidence and updating links. Keep the contract focused on
  everyday workflow rules, as agreed with the user after Task 00 review.

## Dependencies

- [Task 01 — Configure implementer](<task 01 - configure implementer.md>).
- [Task 02 — Configure reviewer](<task 02 - configure reviewer.md>).
- User validation of the representative exercise and any external actions it
  requires under the workflow contract.

## Acceptance criteria

- The agreed workflow runs with two separate roles and preserves task scope.
- A PR targeting `develop` contains a clear change and validation description.
- Code, functional, and applicable visual reviews produce verifiable results.
- Blockers cause corrections and revalidation before final handoff.
- Missing evidence, scope ambiguities, and the correction-round limit produce
  the agreed user handoff instead of an unsupported clean result.
- Task status remains `in_progress` while human approval/merge is pending.
- The user performs the manual merge; the resulting task notes record it.

## Validation

Document the exercise, commands/checks, review findings, evidence, corrections,
PR link, and final result using the location agreed in Task 00. Report any steps
that could not be exercised. Check updated documentation formatting and links.

## Progress notes

Not started. Awaiting role configuration and the agreed validation exercise.
