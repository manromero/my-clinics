# Development workflow contract

This contract defines everyday assignment, implementation, independent review,
correction and delivery rules. Accepted decisions, setup observations and the
representative exercise are preserved in the
[workflow history](milestones/milestone-00-development-workflow/workflow-history.md).

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
activated through repository `AGENTS.md`.

Separate implementer and reviewer agents receive focused assignments and their own
context. Start fresh agents for each task with selected context, excluding unrelated
conversation; reuse the same implementer and reviewer during that task's correction
and re-review rounds. Do not carry task agents over to another assignment.
Only the implementer edits application code, runs implementation checks,
and creates the PR; the reviewer independently reports findings and evidence.
The coordinator preserves those conclusions and does not replace either role.
Use sequential handoffs and one writer at a time in a shared checkout.

Project-scoped native role instructions are versioned in
[`implementer.toml`](../.codex/agents/implementer.toml) and
[`reviewer.toml`](../.codex/agents/reviewer.toml). Select the configured role when
dispatching rather than relying on a generic worker's name. Verify actual loading;
file existence alone is insufficient. If native loading is unavailable, obtain
agreement on explicit-instruction fallback before claiming configuration complete.
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

For visual changes, include a `Visual evidence` section in the PR description
with screenshots displayed inline: at least one desktop capture of each changed
screen, plus a narrow/mobile capture when responsive behavior applies. Follow the
[capture requirements](#visual-pr-evidence) below. For changes with no visual
impact, state that visual evidence is not applicable.

Do not force-push, alter branch protections, change repository merge settings, or
perform release operations as part of an ordinary assignment. Route such needs
to the user. Merge strategy and branch protections remain separate decisions.

## Handoff contract

| Handoff                                    | Required input                                                                                         | Expected output                                                                             | Next responsible role |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------- |
| User to coordinator                        | Task/request and approved references                                                                   | Readiness decision; when ready, branch/base and enriched task marked `in_progress`          | Coordinator           |
| Coordinator to implementer                 | Ready task, execution context, workspace, branch, rules, and checks                                    | Implementation, PR to `develop`, head commit, checks, and evidence                          | Implementer           |
| Implementer to coordinator                 | PR/head, implementation summary, checks, and limitations                                               | Recorded result and focused independent review assignment                                   | Coordinator           |
| Coordinator to reviewer                    | Task, source references, PR, base/head, checks, and evidence                                           | Independent code, functional, and applicable visual review                                  | Reviewer              |
| Reviewer to coordinator                    | Reviewed commit, blockers, optional findings, evidence, and verification steps                         | Recorded findings; correction assignment within remaining budget, or delivery               | Coordinator           |
| Coordinator to implementer for corrections | Blockers, expected verification, current head, and round number                                        | Scoped fixes, new head, checks, and responses, returned to coordinator for re-review        | Implementer           |
| Coordinator to user on escalation          | Current state/PR, evidence, attempted resolutions, impact, and concrete question                       | Decision needed to continue                                                                 | User                  |
| Coordinator to user on delivery            | PR, reviewed head, criteria coverage, checks, review result, rounds, optional suggestions, limitations | Human review/manual merge, or direction for blocked work                                    | User                  |
| Coordinator prepares ready delivery        | Implementation, required checks, and independent review complete                                       | Task/index `done` update included in final review and the same PR; human acceptance pending | Coordinator           |

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

### Visual PR evidence

Capture the running application after implementing the change, using the browser
or screenshot tools available in the session. Use representative states that show
the delivered behavior; add error, empty, focus or before/after captures only when
they help assess the change. Screenshots supplement interaction checks.

- Capture delivery screenshots in a temporary directory outside the repository.
  Do not commit new delivery screenshots or use source commits to host them.
  Supplied design references and historical evidence remain untouched.
- The implementer uploads desktop and, when applicable, mobile screenshots as
  GitHub PR attachments. The coordinator verifies that the saved PR body displays
  the attachment URLs inline before ready delivery; a link to a report alone is
  insufficient. Verify attachment retrieval before deleting temporary captures.
  Local paths and temporary session URLs are insufficient.
- Label each image with the screen/state, actual viewport and captured source
  commit. If image dimensions differ from the viewport, record both. Refresh
  affected captures after visual corrections; do not present an older UI as the
  current result.
- The reviewer checks the images against the running result and relevant design
  references. Record who captured them and who performed live interactions;
  disclose unavailable tools rather than implying independent browser checks.
- Keep useful evidence as GitHub attachments and retain textual capture records
  with those URLs in the PR. Do not create separate `docs/evidence` reports.
  After upload and verification, remove temporary captures,
  throwaway fixtures and scripts before ready delivery. Refresh attachments after
  visual corrections while preserving review history. Do not delete historical
  evidence or rewrite Git history as part of this cleanup.

### Findings and validation

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
- Keep detailed capture metadata and validation evidence in the PR; the task
  retains a concise summary and PR link rather than duplicating the report.
- Attach or link screenshots and other visual evidence from the PR, identifying
  commit and viewport. Do not rely on transient chat output as the only record.
- The coordinator updates the task file and milestone index together, following
  the [shared tracking rules](milestones/readme.md#task-structure-and-status).

Use `in_progress` during implementation, incomplete checks/review, and blocking.
After required validation and independent review pass with no blockers, mark task
and index `done` in the feature branch before delivering the PR. Include the
tracking change in final review. `done` means agent work is complete and ready for
human acceptance; GitHub tracks approval and manual merge separately. The final
handoff explicitly reports these as pending. No post-merge status update or
automatic monitor is required. Reopen delivered work as `in_progress` when new
blockers or requested changes require implementation. A documentation-only task
accepted directly by the user may record that acceptance and become `done` without
a PR. Record that delivery path explicitly.

Final reporting gives the outcome first, then the PR (when applicable), acceptance
coverage, checks and evidence, reviewer conclusion, correction count, optional
suggestions, material limitations, and any decision or manual merge still needed.
