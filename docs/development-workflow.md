# Development workflow contract

Status: workflow decisions and documentation accepted by the user on 2026-10-28.
Task 00 is complete. Role configuration and execution are pending
Tasks 01–03 of [Milestone 00](milestones/milestone-00-development-workflow/readme.md).

## Assignment and readiness

The user starts the workflow by identifying a milestone and task and requesting
implementation with the implementer and reviewer workflow. That assignment
authorizes implementation, checks, branch publication, a PR targeting `develop`,
review, and up to two correction rounds within the validated scope. Tool approval
and authentication requirements still apply. Agents never merge PRs.

Before implementation, the implementer confirms that the task provides:

- The objective, included behavior, and explicit exclusions.
- Verifiable acceptance criteria and expected validation.
- Dependencies and resolved product decisions.
- Applicable requirements, architecture, screen, and design references.

Read [AGENTS.md](../AGENTS.md), the assigned task, [requirements](requirements.md),
[architecture](architecture.md), and applicable [screen references](screens.md).
Missing information that changes product behavior or scope returns to the user.
Routine technical choices remain with the implementer. Continue independent work
while awaiting a decision, without implementing the undecided behavior.

## Roles and coordination

The main agent is the implementer and coordinator. A separate reviewer agent
receives a focused assignment and its own context. Use sequential handoffs:
implementation, review, corrections, and re-review. Only the implementer edits
application files and task tracking; the reviewer reports findings and evidence.
The implementer must preserve the reviewer's conclusions when recording them.

Project-scoped role instructions will be versioned under `.codex/agents/` in
Tasks 01 and 02. Verify that the selected Codex tooling actually loads those
instructions; file existence alone is not proof of configuration. If custom role
loading is unavailable, report it and obtain agreement on an explicit-instruction
fallback before claiming configuration is complete. A request not to edit is a
role boundary, not a separate filesystem security boundary.

The user owns product decisions, scope changes, unresolved review disagreements,
final acceptance, and manual merge. The implementer may not replace an unfavorable
review with its own approval or treat optional suggestions as new requirements.

## Git and PR delivery

Follow the [Git workflow](git-workflow.md). Preserve unrelated changes, update
`develop` from its remote, and create `feature/<short-description>` from that
baseline. Use an isolated worktree if existing work prevents a clean assignment;
do not reset or stash unrelated work without authorization.

Publish the assigned branch and open a PR with base `develop`. Its description
must state the resulting behavior, scope, acceptance-criteria coverage, validation
results, and material limitations. Include the task link and current head commit.
A draft PR can expose blocked work, but must not imply readiness for merge.

Do not force-push, alter branch protections, change repository merge settings, or
perform release operations as part of an ordinary assignment. Route such needs
to the user. Merge strategy and branch protections remain separate decisions.

## Handoff contract

| Handoff                                   | Required input                                                                                   | Expected output                                                                                | Next responsible role |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------- |
| User to implementer                       | Validated task and references                                                                    | Readiness result, branch/base, and task marked `in_progress`                                   | Implementer           |
| Implementer to reviewer                   | Task, scope, project rules, PR, base and head commit, checks, and evidence                       | Review of code, functionality, and visual quality with findings and limitations                | Reviewer              |
| Reviewer to implementer                   | Commit reviewed, blocking findings, optional suggestions, and verification steps                 | Corrections within scope, new head commit, relevant revalidation, and response to each blocker | Implementer           |
| Implementer to reviewer after corrections | Updated PR/head, addressed findings, new checks, and round count                                 | Rechecked findings and affected behavior, including remaining blockers                         | Reviewer              |
| Agent to user on escalation               | Current state, evidence, attempted resolutions, impact, and a concrete question                  | Product/scope decision or direction to unblock the task                                        | User                  |
| Implementer to user on delivery           | PR, reviewed head commit, criteria coverage, checks, review result, rounds used, and limitations | Human review and manual merge, or requested changes                                            | User                  |
| User merge to implementer                 | Verified merge into `develop`                                                                    | Task and milestone tracking updated with merge evidence                                        | Implementer           |

Every review identifies the exact head commit and base reviewed. Any subsequent
code change requires review of the affected changes and behavior and appropriate
revalidation before delivery. A review of an older commit is not approval of the
current PR. Documentation changes after review require corresponding link,
formatting, and consistency checks.

## Review and evidence

The reviewer independently inspects the diff and verifies applicable evidence;
the implementer's assertions alone are insufficient. Address all perspectives:

- Code: correctness, regressions, project conventions, maintainability, and
  relevant automated checks.
- Functionality: acceptance criteria, interactions, and applicable boundary,
  loading, empty, and error cases.
- Visual quality: for UI changes, inspect the running result on desktop and
  mobile against Alexandria and the relevant Stitch references. Record viewport
  dimensions, screenshots, commit, and observed gaps. For other work, explain why
  visual review does not apply.

Each finding has an identifier, classification, file/line or screen location,
concrete problem, impact, supporting evidence, and a way to verify correction.
Use these classifications independently of any priority label:

- **Blocking:** an acceptance-criteria failure, defect, regression, or missing
  required validation that prevents supported acceptance.
- **Optional:** an improvement that is unnecessary for the agreed scope. Record
  it separately and collect it for the final PR handoff. Do not pause the workflow,
  request an intermediate decision, implement it, or consume a correction round
  for an optional suggestion. The user considers these suggestions during their
  PR review and may approve follow-up work as a separate scope decision.

Each blocker is recorded as open, fixed and verified, or explicitly resolved by a
user decision. A user changing a requirement must be recorded as a scope decision,
not as evidence that a failed check passed. Disputed blockers remain open until
resolved; present both positions and evidence to the user without repeated debate.

Run the checks required by [AGENTS.md](../AGENTS.md). Record command, result,
commit, and relevant output or evidence link. Failed, unavailable, or unperformed
required checks prevent a clean result. Report infrastructure problems distinctly
from application failures and continue only independent work. Do not invent test
results or add unrelated changes to make checks pass. Tests should verify useful
behavior or risk, rather than mirror the implementation.

## Correction rounds and escalation

The maximum is **two automatic correction rounds after the initial review**:

1. Initial implementation and review.
2. Correction round 1 and re-review.
3. Correction round 2 and final re-review.

A round is one batch of corrections followed by the reviewer's recheck; multiple
findings in a batch do not consume separate rounds. Track the count in task notes
and review records. Newly discovered blockers join the remaining budget; they do
not reset it. If no blockers remain and required checks are complete, deliver.

If blockers remain after round 2, stop automatic corrections and hand the current
PR and evidence to the user. Additional rounds require an explicit user decision.
Escalate product ambiguity, scope changes necessary to complete the assignment,
unresolved blocking review disagreements, and missing permissions or infrastructure
when they require a user decision to proceed rather than waiting for the round
limit. Resolve routine technical problems autonomously within scope. Optional
improvements wait for the final PR handoff and never trigger escalation.
Distinguish a blocked handoff from a ready-for-merge delivery.

User-requested changes after delivery are checked against the agreed scope. They
require appropriate implementation, validation, and separate review; delivery is
not a reason to bypass review or silently restart the correction budget.

## Records and task status

- The task file is the source of truth for status, approved decisions, blockers,
  a concise validation summary, correction count, and PR/merge links.
- The PR holds the implementation description, criteria coverage, detailed check
  results, reviewer findings, correction responses, and linked evidence. Preserve
  review history when updating the description.
- Attach or link screenshots and other visual evidence from the PR, identifying
  commit and viewport. Do not rely on transient chat output as the only record.
- The implementer updates the task file and milestone index together, following
  the [shared tracking rules](milestones/readme.md#task-structure-and-status).

Use `in_progress` during implementation, review, blocking, and the wait for manual
merge. Mark a PR-delivered task `done` only after verifying the user's merge into
`develop`; record the PR and merge commit. A documentation-only task accepted
directly by the user may instead record that acceptance and become `done` without
a PR. Record that delivery path explicitly. Task 00 uses this direct-documentation
path; the user accepted the resulting document on 2026-10-28, completing Task 00.

Final reporting gives the outcome first, then the PR (when applicable), acceptance
coverage, checks and evidence, reviewer conclusion, correction count, optional
suggestions, material limitations, and any decision or manual merge still needed.

## Representative exercise for Task 03

Use a temporary workflow demonstration page with one responsive card and a simple
interaction, without persistence or clinic business rules. Before implementation,
write its exact acceptance criteria and visual reference in the exercise task.
The page must support desktop/mobile inspection and observable interaction.

Keep a known-defect fixture separate from the passing demonstration page. Define
one reproducible blocker and one optional suggestion in the fixture's exercise
instructions, so review must distinguish them. Review the fixture, correct the
blocker, and revalidate it without introducing defects into product behavior.
Keep the fixture outside production routes; label it as an exercise artifact.

Use documented scenarios to exercise an ambiguous product request, unavailable
required evidence, a disputed blocker, and blockers remaining after two rounds.
Record the expected user handoff for each. Simulation is evidence of contract
coverage, not proof that real correction rounds or checks were executed.

Task 03 must demonstrate a real PR targeting `develop`, independent code,
functional and visual review, at least one actual fixture correction/recheck,
evidence recording, and manual user merge. Remove the temporary production page
before the final PR is ready, and review the resulting removal. Retain the
exercise report and clearly identified fixtures as agreed in its task. Exact
exercise details are refined before Task 03 without changing this validated scope.

## Task 00 walkthrough

The following is a desk walkthrough, not an executed agent or PR exercise:

1. The user assigns the demonstration task with criteria and references. The
   implementer checks readiness, creates its feature branch from `develop`, and
   updates task and index to `in_progress`.
2. The implementer supplies a PR, head commit, checks, and desktop/mobile evidence.
   The reviewer independently checks the three perspectives at that commit.
3. A fixture interaction fails a criterion (blocking); a cosmetic preference is
   optional. Both have evidence and verification steps. The optional item does
   not enter implementation scope and waits for the final PR handoff without
   interrupting corrections or requiring an intermediate user decision.
4. The implementer fixes the blocker in round 1 and reruns affected checks. The
   reviewer verifies the new head and correction. Passing checks and no remaining
   blockers allow delivery; the task stays `in_progress` until manual merge.
5. If a required check cannot run, the result stays incomplete. If behavior is
   ambiguous or a blocker is disputed, the user receives the concrete decision.
   If blockers persist through round 2, further corrections await user direction.
6. After the user's merge is verified, the implementer records merge evidence and
   updates task and index to `done`. These steps will be exercised in Task 03.

## Technical baseline and remaining work

Verified on 2026-10-28: `main` and remote `develop` both pointed to `92de852`;
Git push succeeded. This repository uses Git's `schannel` TLS backend. GitHub CLI
2.103.3 was installed and authenticated as `manromero` with repository admin
access. The active desktop session could invoke it at
`C:/Program Files/GitHub CLI/gh.exe`; PATH discovery still required a refreshed
environment. `main` was the default branch; both branches were unprotected, all
three merge methods were enabled, and there were no open PRs.

These are observations, not permanent guarantees. Recheck access and remote state
when starting work. No test PR has been created, and branch protection, merge
strategy, and role loading have not been configured or validated. GitHub API and
push access are established; the full workflow remains for Tasks 01–03.

The user approved coordination, the two-round limit, evidence locations, and the
representative exercise on 2026-10-28. Merge strategy and branch protections remain
open decisions and do not block writing or configuring the role instructions.

Reference: [official Codex subagent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents).
