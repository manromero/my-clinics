# Task 00 — Define workflow

Status: `done`

## Objective

Define and obtain user validation of the executable contract between the user,
implementer, and reviewer described in the [milestone](readme.md).

## Scope

- Inspect available agent tooling, Git repository/remote configuration, and PR
  capabilities. Preserve unrelated local changes.
- Present options for assignment, coordination, review evidence, correction-round
  limits, and the representative validation exercise. Wait for user decisions.
- Document task intake, role boundaries, handoffs, PR targeting, review findings,
  correction rounds, escalation, final reporting, and task-status updates.
- Specify the information required before an assignment is ready to implement.
- Keep product and scope decisions with the user, and PR merge manual.

## Dependencies

The milestone's two-agent approach and configuration choices were validated by
the user on 2026-10-28. The resulting documentation was also accepted on that date.

## Acceptance criteria

- The user has validated the unresolved configuration choices.
- Each handoff identifies its input, expected output, and next responsible role.
- The contract covers blocked work, failed checks, review disagreements, and the
  correction-round limit without silently expanding scope.
- Blocking findings and optional improvements are distinguishable.
- Task files and the milestone index stay consistent with actual progress.

## Validation

Walk through a sample assignment against the documented contract. Check local
documentation links and formatting. Record decisions and unresolved questions.

## Progress notes

- 2026-10-28: the user approved task-triggered implementation with a separate
  reviewer, two correction rounds, task/PR evidence locations, and a temporary UI
  exercise with a separate defect fixture.
- User clarification: collect optional improvements for the final PR handoff and
  human review. They never pause the workflow, trigger intermediate approval, or
  consume correction rounds. Escalate early only when a user decision is needed
  to complete the assigned scope.
- Published the existing `main` commits and created remote `develop` from commit
  `92de852`. Verified push access and authenticated GitHub CLI access as
  `manromero` with admin permission. Resolved Git TLS access using the Windows
  certificate store (`schannel`) for this repository.
- Documented the [workflow contract](../../development-workflow.md), linked it
  from project guidance, and clarified that feature PR merges belong to the user.
- Completed the contract's sample-assignment desk walkthrough, covering intake,
  evidence, blocker/optional classification, correction/re-review, missing checks,
  scope escalation, disagreements, the round limit, and final tracking. This is
  documentation validation; no configured-agent or PR exercise has run.
- Delivery path: direct documentation acceptance by the user, without a PR for
  Task 00. On 2026-10-28 the user explicitly approved the resulting document;
  Task 00 is `done`.
- The user explicitly authorized committing and integrating this accepted
  documentation directly into `develop` without a PR. This is a Task 00 bootstrap
  exception; subsequent implementation follows the normal PR workflow.
- After Task 03, move the representative exercise, desk walkthrough, and temporary
  setup notes out of the operational contract into the milestone's historical
  records, preserving the exercise evidence. This cleanup was agreed with the user.
- Role loading and execution remain for Tasks 01–03. Merge strategy and branch
  protections are open decisions and do not block role configuration.
- Validation: Prettier formatting passed for all changed documentation and the
  milestone task directory. Verified 37 local Markdown links, including referenced
  heading anchors, across the seven changed files. `git diff --check` passed.
  Application checks are not applicable to this documentation-only change.
