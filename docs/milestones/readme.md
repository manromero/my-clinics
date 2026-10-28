# Project milestones

This directory contains milestone descriptions and their task files. All
documentation is in English. Milestones and tasks are defined with the user
before implementation begins.

## Milestone index

| Milestone                                                                | Description                                                                    | Planning status                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| [00 — Development workflow](milestone-00-development-workflow/readme.md) | Coordinator, implementer, and reviewer workflow with human PR review and merge | Task 00 complete; Task 04 in progress; Tasks 01–03 pending |

Further milestones will be added after the user validates their scope and order.

## Task structure and status

Each milestone has a `readme.md` with its objective, submilestones, task index,
dependencies, and completion criteria. Tasks use the filename pattern
`task NN - description.md` and include their status, objective, scope,
dependencies, acceptance criteria, validation, and progress notes.

Every task has exactly one current status:

| Status        | Meaning                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `pending`     | Work has not started                                                                           |
| `in_progress` | Work has started; implementation, review, or human approval remains open                       |
| `done`        | Acceptance criteria and required validation are satisfied and the user has accepted the result |

The task file is the source of truth for its status. Update its status and the
milestone's task-index row together whenever work starts or changes state.
Record relevant progress, validation results, open issues, and PR links in the
task file. Planning a task does not start its implementation.

For a task delivered through a PR, keep `in_progress` throughout implementation,
review, and the wait for the user's manual merge into `develop`. Mark it `done`
after that merge and update its progress notes. For a documentation-only task
accepted directly by the user, record that acceptance instead.

If work cannot proceed, keep the applicable current status and describe the
blocker and required user decision in progress notes. Status changes must reflect
actual work and acceptance, rather than elapsed time or an agent's prediction.
