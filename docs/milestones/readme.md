# Project milestones

This directory contains milestone descriptions and their task files. All
documentation is in English. Milestones and tasks are defined with the user
before implementation begins.

## Milestone index

| Milestone                                                                | Description                                                                    | Planning status                                               |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| [00 — Development workflow](milestone-00-development-workflow/readme.md) | Coordinator, implementer, and reviewer workflow with human PR review and merge | Tasks 00/04/01 complete; Task 02 in progress; Task 03 pending |

Further milestones will be added after the user validates their scope and order.

## Task structure and status

Each milestone has a `readme.md` with its objective, submilestones, task index,
dependencies, and completion criteria. Tasks use the filename pattern
`task NN - description.md` and include their status, objective, scope,
dependencies, acceptance criteria, validation, and progress notes.

Every task has exactly one current status:

| Status        | Meaning                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `pending`     | Work has not started                                                                                   |
| `in_progress` | Work has started; implementation, checks, review, or blocking decisions remain open                    |
| `done`        | Implementation, required checks, and independent agent review are complete; ready for human acceptance |

The task file is the source of truth for its status. Update its status and the
milestone's task-index row together whenever work starts or changes state.
Record relevant progress, validation results, open issues, and PR links in the
task file. Planning a task does not start its implementation.

For a task delivered through a PR, the coordinator marks the task and milestone
index `done` in the feature branch before final delivery, after implementation,
required checks, and independent review are complete with no blocking findings.
Include the tracking update in final review and commit it in the same PR. State
explicitly that human approval and manual merge remain pending; GitHub is the
source of truth for those steps. `done` does not mean human acceptance or merge.
No post-merge tracking commit or automatic merge monitor is required.

Keep blocked or incompletely validated work `in_progress`. If new blockers or
requested changes reopen a delivered task, return it and its index row to
`in_progress` until revalidated and reviewed. For a documentation-only task
accepted directly by the user, record that acceptance as the completion evidence.

If work cannot proceed, keep the applicable current status and describe the
blocker and required user decision in progress notes. Status changes must reflect
actual work and acceptance, rather than elapsed time or an agent's prediction.
