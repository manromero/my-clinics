# Milestone 00 — Development workflow

Scope: validated by the user. Implementation: not started.

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
to the user. Automatic correction rounds must be bounded; their exact limit
requires user validation before configuring the workflow.

## Submilestones and tasks

| Submilestone          | Task                                                               | Status    | Depends on                                 |
| --------------------- | ------------------------------------------------------------------ | --------- | ------------------------------------------ |
| Workflow definition   | [00 — Define workflow](<task 00 - define workflow.md>)             | `pending` | User validation of configuration decisions |
| Agent configuration   | [01 — Configure implementer](<task 01 - configure implementer.md>) | `pending` | Task 00                                    |
| Agent configuration   | [02 — Configure reviewer](<task 02 - configure reviewer.md>)       | `pending` | Task 00                                    |
| Workflow verification | [03 — Validate workflow](<task 03 - validate workflow.md>)         | `pending` | Tasks 01 and 02                            |

Task statuses follow the [shared tracking rules](../readme.md#task-structure-and-status).
The existence of these task files does not mean the agents are configured.

## Decisions requiring validation before implementation

- How assignment starts the workflow and how the two agents are configured and
  coordinated in the selected tooling.
- The limit on automatic correction/review rounds and the handoff when reached.
- Where review findings, validation evidence, and workflow progress are recorded.
- A small representative task or exercise for verifying the workflow.

Task 00 must present concrete options for these decisions and obtain user
validation. Inspect available tooling and repository configuration to establish
facts before asking the user to choose.

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
