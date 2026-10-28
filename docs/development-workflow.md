# Development workflow contract

Status: workflow decisions and documentation accepted by the user on 2026-10-28.
Task 00 is complete. The user subsequently approved a coordinator, implementer,
and reviewer. Coordinator configuration is complete in Task 04; delegated role
configuration and execution remain Tasks 01–03 of
[Milestone 00](milestones/milestone-00-development-workflow/readme.md).

## Assignment and readiness

The user starts the workflow by identifying a milestone and task and requesting
implementation with the coordinator, implementer, and reviewer workflow. That assignment
authorizes implementation, checks, branch publication, a PR targeting `develop`,
review, and up to two correction rounds within the validated scope. Tool approval
and authentication requirements still apply. Agents never merge PRs.

Before implementation, the coordinator confirms that the task provides:

- The objective, included behavior, and explicit exclusions.
- Verifiable acceptance criteria and expected validation.
- Dependencies and resolved product decisions.
- Applicable requirements, architecture, screen, and design references.

Read [AGENTS.md](../AGENTS.md), the assigned task, [requirements](requirements.md),
[architecture](architecture.md), and applicable [screen references](screens.md).
Missing information that changes product behavior or scope returns to the user.
Routine technical choices remain with the responsible agent. Continue independent work
while awaiting a decision, without implementing the undecided behavior.

## Roles and coordination

The primary agent is the coordinator. It checks readiness, creates the assignment
branch, enriches the task, delegates, counts correction rounds, maintains tracking,
and manages final PR delivery. Follow its [role instructions](agents/coordinator.md),
activated through repository `AGENTS.md` in Task 04.

Separate implementer and reviewer agents receive focused assignments and their own
context. Only the implementer edits application code, runs implementation checks,
and creates the PR; the reviewer independently reports findings and evidence.
The coordinator preserves those conclusions and does not replace either role.
Use sequential handoffs and one writer at a time in a shared checkout.

Project-scoped delegated role instructions will be versioned under `.codex/agents/`
in Tasks 01 and 02. Verify actual loading; file existence alone is insufficient.
If native loading is unavailable, obtain agreement on explicit-instruction fallback
before claiming configuration complete. Bootstrap review of coordinator setup may
use a separate agent explicitly instructed with this contract; label it as such,
without claiming delegated role configuration or full workflow validation.
A request not to edit is a role boundary, not a separate security sandbox.

If the task already exists, the coordinator preserves approved scope and criteria.
If a file must be created, derive it from the approved user request and the shared
task structure; do not invent product requirements. Missing scope decisions return
to the user before implementation. When ready, record branch/base, relevant files,
sourced technical findings, labeled hypotheses, validation considerations, open
questions, and round count in a separate `Execution context` section. Context does
not silently amend acceptance criteria. Blocked intake records the issue without
creating an implementation branch or dispatching an implementer.

The user owns product decisions, scope changes, unresolved review disagreements,
final acceptance, and manual merge. The implementer may not replace an unfavorable
review with its own approval or treat optional suggestions as new requirements.

## Git and PR delivery

The coordinator follows the [Git workflow](git-workflow.md). Preserve unrelated changes, update
`develop` from its remote, and create `feature/<short-description>` from that
baseline. Use an isolated worktree if existing work prevents a clean assignment;
do not reset or stash unrelated work without authorization.

The implementer publishes the assigned branch and opens a PR with base `develop`. Its description
must state the resulting behavior, scope, acceptance-criteria coverage, validation
results, and material limitations. Include the task link and current head commit.
A draft PR can expose blocked work, but must not imply readiness for merge.

Do not force-push, alter branch protections, change repository merge settings, or
perform release operations as part of an ordinary assignment. Route such needs
to the user. Merge strategy and branch protections remain separate decisions.

## Handoff contract

| Handoff                                    | Required input                                                                                         | Expected output                                                                      | Next responsible role |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | --------------------- |
| User to coordinator                        | Task/request and approved references                                                                   | Readiness decision; when ready, branch/base and enriched task marked `in_progress`   | Coordinator           |
| Coordinator to implementer                 | Ready task, execution context, workspace, branch, rules, and checks                                    | Implementation, PR to `develop`, head commit, checks, and evidence                   | Implementer           |
| Implementer to coordinator                 | PR/head, implementation summary, checks, and limitations                                               | Recorded result and focused independent review assignment                            | Coordinator           |
| Coordinator to reviewer                    | Task, source references, PR, base/head, checks, and evidence                                           | Independent code, functional, and applicable visual review                           | Reviewer              |
| Reviewer to coordinator                    | Reviewed commit, blockers, optional findings, evidence, and verification steps                         | Recorded findings; correction assignment within remaining budget, or delivery        | Coordinator           |
| Coordinator to implementer for corrections | Blockers, expected verification, current head, and round number                                        | Scoped fixes, new head, checks, and responses, returned to coordinator for re-review | Implementer           |
| Coordinator to user on escalation          | Current state/PR, evidence, attempted resolutions, impact, and concrete question                       | Decision needed to continue                                                          | User                  |
| Coordinator to user on delivery            | PR, reviewed head, criteria coverage, checks, review result, rounds, optional suggestions, limitations | Human review/manual merge, or direction for blocked work                             | User                  |
| User merge to coordinator                  | Verified merge into `develop`                                                                          | Task and milestone updated with merge evidence                                       | Coordinator           |

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
findings in a batch do not consume separate rounds. The coordinator tracks the count in task notes
and review records. Newly discovered blockers join the remaining budget; they do
not reset it. If no blockers remain and required checks are complete, deliver.

After each implementation/correction, the coordinator dispatches review. After
the final review, it delivers either a ready PR or a blocked PR with evidence;
there is no third automatic correction. A clean earlier review skips remaining rounds.

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
- The coordinator updates the task file and milestone index together, following
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
   coordinator checks readiness, creates the feature branch from `develop`, adds
   execution context, updates task/index, and dispatches the implementer.
2. The implementer supplies a PR, head commit, checks, and desktop/mobile evidence.
   The coordinator dispatches the reviewer to independently check that commit.
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
6. After the user's merge is verified, the coordinator records merge evidence and
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
push access are established; full validation follows coordinator setup (Task 04)
and delegated role configuration (Tasks 01–02), with the exercise in Task 03.

The user approved coordination, the two-round limit, evidence locations, and the
representative exercise on 2026-10-28. Merge strategy and branch protections remain
open decisions and do not block writing or configuring the role instructions.

Later on the same date, the user approved a primary coordinator and separate
implementer/reviewer agents, followed by explicit authorization to update this
contract and configure the coordinator. This supersedes the original combined
implementer/coordinator role; the two-round budget and manual merge remain intact.

Reference: [official Codex subagent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents).
