# Milestone 00 — Development workflow

Scope, workflow decisions, and Task 00 documentation: accepted by the user.
Coordinator and both native delegated roles are configured and validated through
Tasks 04, 01, and 02. Task 02 was merged in PR #3. Task 03 completed the global
agent validation and is delivered in PR #4; GitHub tracks human approval and
manual merge separately from task completion.

## Objective

Create a repeatable workflow in which a coordinator prepares a user-assigned task,
an implementer develops it, and a separate reviewer checks it before the user
reviews and manually merges its PR into `develop`.

## Confirmed workflow

1. The user assigns a task with a validated scope and acceptance criteria.
2. The coordinator verifies readiness, resolves technical context, asks for missing
   product decisions, and, when ready, creates the branch and enriches the task.
   It then dispatches the implementer. The implementer reads the task, project instructions, requirements, and
   relevant screen references; implements the change; runs required checks;
   and opens a PR targeting `develop`.
3. The reviewer evaluates code, functionality, and visual quality. For UI work,
   compare against Alexandria and the relevant Stitch references on desktop and
   mobile. For other work, explain why visual review is not applicable.
4. Findings distinguish blocking problems from optional improvements. Optional
   suggestions do not automatically expand the assigned scope.
5. The coordinator routes blockers through at most two implementation correction
   rounds, each followed by reviewer verification. Optional findings wait for final delivery.
6. The coordinator delivers the PR and evidence: ready if no blockers remain and
   required checks passed, or blocked with a concrete decision after the round limit.
7. The user reviews and manually merges the PR into `develop`.

Product ambiguities, scope changes, and unresolved review disagreements return
to the user. The approved limit is two automatic correction rounds after the
initial review. See the [development workflow contract](../../development-workflow.md)
for everyday handoffs, evidence and escalation; the
[exercise](https://github.com/manromero/my-clinics/blob/9f9d3c4aea998a013db46524d54f57682235d25a/docs/milestones/milestone-00-development-workflow/workflow-exercise.md), [validation report](workflow-validation.md) and
[history](workflow-history.md) preserve the milestone-specific demonstration.

## Submilestones and tasks

| Submilestone          | Task                                                               | Status | Depends on                               |
| --------------------- | ------------------------------------------------------------------ | ------ | ---------------------------------------- |
| Workflow definition   | [00 — Define workflow](<task 00 - define workflow.md>)             | `done` | User acceptance recorded on 2026-10-28   |
| Agent configuration   | [04 — Configure coordinator](<task 04 - configure coordinator.md>) | `done` | Task 00 and approved three-role revision |
| Agent configuration   | [01 — Configure implementer](<task 01 - configure implementer.md>) | `done` | Task 04                                  |
| Agent configuration   | [02 — Configure reviewer](<task 02 - configure reviewer.md>)       | `done` | Task 04                                  |
| Workflow verification | [03 — Validate workflow](<task 03 - validate workflow.md>)         | `done` | Tasks 04, 01, and 02                     |

Task statuses follow the [shared tracking rules](../readme.md#task-structure-and-status).
The existence of these task files does not mean the agents are configured.
Task identifiers are preserved; execution order is 00 → 04 → 01/02 → 03.

## Validated decisions and remaining work

The user approved the following on 2026-10-28:

- A task assignment starts the workflow. The revised design separates coordinator,
  implementer, and reviewer. The primary coordinator is activated through
  `AGENTS.md` in Task 04; delegated agents are configured in Tasks 01 and 02.
  Verify actual instruction loading rather than file existence.
- Two automatic correction rounds follow the initial review; remaining blockers
  return to the user with the current PR and evidence.
- Task files record progress and decisions; PRs record detailed review and
  validation, including linked visual evidence.
- Task 03 uses a temporary UI demonstration and a separate known-defect fixture,
  with documented escalation scenarios and manual user merge.

Task 00 is complete following user acceptance on 2026-10-28. Git push and GitHub CLI
access have been verified, and remote `develop` has been created from `main`.
Coordinator, native implementer, and native reviewer configuration are complete;
the end-to-end agent workflow exercise passed with two correction rounds and no
remaining blockers. Task 03's ready-delivery tracking is part of PR #4, with final
administrative review; human approval/manual merge are tracked in GitHub. Merge strategy and
branch protections are separate open decisions.

## Completion criteria

- All three roles are configured according to the revised user-validated contract.
- A representative assignment demonstrates implementation, PR creation, review,
  corrections, and a final handoff to the user.
- Reviews cover all applicable perspectives and cite supporting evidence.
- Missing checks and blocking findings prevent a clean review result.
- Scope questions and the correction-round limit route work back to the user.
- Agents never merge the PR; the user retains that step.
- All milestone tasks are `done` under the shared tracking rules.

## References

- [Agent instructions](../../../AGENTS.md)
- [Git workflow](../../git-workflow.md)
- [Requirements](../../requirements.md)
- [Architecture](../../architecture.md)
- [Screens and visual references](../../screens.md)
