# Task 01 — Configure implementer

Status: `pending`

## Objective

Configure the implementer role to execute an assigned task using the validated
workflow contract from [Task 00](<task 00 - define workflow.md>).

## Scope

- Create the role instructions and configuration agreed in Task 00.
- Require reading the assigned task, project instructions, requirements, and
  relevant architecture and design references before implementation.
- Receive the coordinator's prepared branch and execution context, based on
  `develop`, and preserve unrelated work without creating another assignment branch.
- Implement only the assigned scope and run the checks appropriate to the change.
- Open a PR targeting `develop`, describing the result, acceptance-criteria
  coverage, checks, and material limitations.
- Return implementation evidence and blocking corrections to the coordinator,
  which dispatches review and owns the two-round correction budget.
- Supply progress evidence to the coordinator, which owns task/index tracking.

## Dependencies

Task 00 is complete, the three-role revision is approved, and
[Task 04 — Configure coordinator](<task 04 - configure coordinator.md>) is complete.

## Acceptance criteria

- The role receives a task and produces the artifacts required by the contract.
- Product ambiguities and scope changes return to the user.
- Failed or unavailable checks are reported accurately.
- Changes following review trigger the required revalidation.
- The implementer hands off to the coordinator for independent review and never
  merges its PR or takes over coordination.

## Validation

Check configuration loading in the selected tooling and exercise task intake and
handoff with the agreed validation approach. Check documentation formatting and
links; run any configuration checks supported by that tooling.

## Progress notes

Not started. Tasks 00 and 04 are complete; dependencies are satisfied under the
approved three-role revision. Configure a delegated implementer receiving a ready
task and branch.
