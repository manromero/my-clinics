# Milestone 00 — Development workflow

Scope, workflow decisions, and Task 00 documentation: accepted by the user.
Task 00 is complete. Agent configuration and execution have not started.

## Objective

Create a repeatable workflow in which the user assigns a validated task, an
implementer develops it, and a separate reviewer checks it before the user
reviews and manually merges its PR into `develop`.

## Confirmed workflow

1. The user assigns a task with a validated scope and acceptance criteria.
2. The implementer reads the task, project instructions, requirements, and
   relevant screen references; implements the change; runs required checks;
   and opens a PR targeting `develop`.
3. The reviewer evaluates code, functionality, and visual quality. For UI work,
   compare against Alexandria and the relevant Stitch references on desktop and
   mobile. For other work, explain why visual review is not applicable.
4. Findings distinguish blocking problems from optional improvements. Optional
   suggestions do not automatically expand the assigned scope.
5. The implementer addresses blockers, and the reviewer checks the corrections.
6. When no blockers remain, present the PR and validation summary to the user.
7. The user reviews and manually merges the PR into `develop`.

Product ambiguities, scope changes, and unresolved review disagreements return
to the user. The approved limit is two automatic correction rounds after the
initial review. See the [development workflow contract](../../development-workflow.md)
for handoffs, evidence, escalation, and the representative exercise.

## Submilestones and tasks

| Submilestone          | Task                                                               | Status    | Depends on                             |
| --------------------- | ------------------------------------------------------------------ | --------- | -------------------------------------- |
| Workflow definition   | [00 — Define workflow](<task 00 - define workflow.md>)             | `done`    | User acceptance recorded on 2026-10-28 |
| Agent configuration   | [01 — Configure implementer](<task 01 - configure implementer.md>) | `pending` | Task 00                                |
| Agent configuration   | [02 — Configure reviewer](<task 02 - configure reviewer.md>)       | `pending` | Task 00                                |
| Workflow verification | [03 — Validate workflow](<task 03 - validate workflow.md>)         | `pending` | Tasks 01 and 02                        |

Task statuses follow the [shared tracking rules](../readme.md#task-structure-and-status).
The existence of these task files does not mean the agents are configured.

## Validated decisions and remaining work

The user approved the following on 2026-10-28:

- A task assignment starts the workflow. The main agent implements and coordinates
  a separate reviewer, with project-scoped role instructions configured in Tasks
  01 and 02 and their actual loading verified.
- Two automatic correction rounds follow the initial review; remaining blockers
  return to the user with the current PR and evidence.
- Task files record progress and decisions; PRs record detailed review and
  validation, including linked visual evidence.
- Task 03 uses a temporary UI demonstration and a separate known-defect fixture,
  with documented escalation scenarios and manual user merge.

Task 00 is complete following user acceptance on 2026-10-28. Git push and GitHub CLI
access have been verified, and remote `develop` has been created from `main`.
Role configuration and the actual PR exercise remain pending. Merge strategy and
branch protections are separate open decisions.

## Completion criteria

- Both roles are configured according to a user-validated workflow contract.
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
