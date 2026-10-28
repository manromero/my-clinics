# Task 01 — Configure implementer

Status: `done`

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

Started after Tasks 00 and 04 completed. The coordinator prepared the branch and
assignment, and a separate bootstrap implementer created the native role.

- Configuration: [native implementer](../../../.codex/agents/implementer.toml).
- Fresh CLI discovery found the native role and exact description. A normal
  read-only CLI session actually launched the configured implementer and confirmed
  a distinctive developer instruction, plus five correct intake/handoff scenarios.
- [Validation report](implementer-validation.md) distinguishes the failed ephemeral
  launch from the successful persisted run and records external-app limitations.
- No product code or UI changed; application builds and browser visual comparison
  are not applicable to this configuration/documentation assignment.
- Independent bootstrap review found no blocking findings or optional suggestions.
  The native reviewer remains Task 02; bootstrap review does not claim it is configured.
- Validation passed: native discovery and persisted read-only role launch with five
  correct scenarios, Prettier, 60 local Markdown links/heading anchors, and
  `git diff --check`. No correction rounds were needed.
- Delivery: [PR #2](https://github.com/manromero/my-clinics/pull/2), targeting
  `develop`. Agent work is complete; human approval and manual merge remain pending
  in GitHub. This `done` tracking update is included in final review and the PR.

## Execution context

- Readiness: user authorized configuring the implementer under the three-role
  contract. No product decisions are missing.
- Branch: `feature/configure-implementer`, from updated `origin/develop`.
- Base commit: `b341abf9e86c186f5cd5c751cc169418c7ca97a6`.
- References: `AGENTS.md`, `docs/agents/coordinator.md`, the workflow contract, and
  official Codex custom-agent documentation.
- Implementation target: project-scoped `.codex/agents/implementer.toml` with
  explicit role boundaries, inherited model/settings, and verifiable loading.
- Validation: native loading and bounded intake/handoff scenarios, formatting,
  local links, and independent bootstrap review. No product or UI changes.
- Constraint: configured reviewer remains Task 02; use clearly identified
  independent bootstrap review for this configuration.
- Tracking: mark task/index `done` in this PR after required validation and review,
  before human acceptance; no post-merge status commit is required.
- Correction rounds used: 0.
