# Coordinator role

## Activation and boundaries

When the user assigns implementation work in MyClinics, the primary Codex agent
acts as coordinator. Read this file and the [workflow contract](../development-workflow.md).
Answer informational requests without starting implementation. Delegated agents
retain their explicitly assigned roles; they must not become coordinators merely
because they inherit repository instructions.

Own intake, readiness, branch setup, execution context, delegation, round counting,
tracking, and final PR delivery. Delegate implementation and review to separate
agents, sequentially. Do not implement application changes or replace an
independent review with your own verdict. Do not add more agents without a task
need. Only one agent may mutate the shared checkout at a time.

Keep the session's selected model, reasoning, permissions, and tools. Do not change
user-wide settings, bypass approvals, or claim that instructions enforce a separate
sandbox. Never merge PRs or perform release operations.

## Receive and prepare the assignment

1. Resolve the milestone and task. Read [AGENTS.md](../../AGENTS.md), the task,
   [Git workflow](../git-workflow.md), and relevant requirements, architecture,
   and design references. Verify scope, exclusions, testable acceptance criteria,
   dependencies, validation expectations, and necessary tools/access.
2. Investigate missing technical facts using repository evidence and relevant
   primary sources. Resolve routine choices autonomously. Ask the user only for
   a decision needed to complete the assigned scope, such as ambiguous product
   behavior, necessary scope expansion, or access that cannot be obtained.
3. If a task file exists, preserve its approved objective and criteria. If one
   must be created, use the [task structure](../milestones/readme.md#task-structure-and-status)
   and the user's approved request. Do not invent product requirements. A proposed
   definition awaiting scope approval is not ready for implementation.
4. Inspect the checkout and remote. Preserve unrelated work. Once ready, update
   `develop` and create a feature branch from it. Use a suitable isolated worktree
   if required by existing work. Record branch and base commit. Do not reset,
   overwrite, or silently stash another person's changes.
5. Mark task and milestone index `in_progress` together when execution starts.
   An intake that remains blocked records the blocker in the appropriate current
   status; it does not create an implementation branch or dispatch an implementer.
6. Add an `Execution context` section to the task: readiness result, branch/base,
   relevant files and sources, verified findings, clearly labeled hypotheses,
   constraints, validation considerations, open questions, and correction count
   (initially 0). Keep approved scope separate from discovered context. Avoid
   credentials, machine-specific assumptions, and unverified conclusions.

## Delegate and coordinate

Start one fresh implementer and one separate fresh reviewer for each task. Supply
selected task context rather than inheriting unrelated conversation. Retain those
same agents for that task's correction and re-review rounds; do not start fresh
agents for each round or reuse agents from another task. Keep handoffs sequential.

Select the native `implementer` role defined in
[`.codex/agents/implementer.toml`](../../.codex/agents/implementer.toml) and dispatch
it with the task/context, workspace and branch,
project rules, required checks, expected PR output, and the instruction to return
results to you. The implementer owns application edits, checks, commits, branch
publication, and PR creation with base `develop`. You own task tracking and the
assignment branch. Coordinate any task-file edits and tracking commits sequentially.

After implementation stops editing, select the native
[`reviewer`](../../.codex/agents/reviewer.toml) role after verifying availability
in the active session. Supply the
task, approved criteria, independent source references, PR, base and head commits,
checks, evidence, and current correction round. Require code, functional, and
applicable visual review,
concrete blocking findings, optional suggestions, and limitations. Reviewers must
verify claims independently. They report findings and do not edit product files.

Run this sequence and stop early whenever the result is clean:

1. Initial implementation, then initial review.
2. If blockers remain, correction round 1 by the implementer, then re-review.
3. If blockers remain, correction round 2 by the implementer, then final review.
4. If blockers still remain, deliver the blocked PR and request user direction.
   Never dispatch correction round 3 automatically or reset the counter when a
   new blocker appears. Record the reviewed commit and findings after each review.

Revalidation and review must cover the current head and affected behavior. A
missing required check prevents a clean result. Resolve ordinary technical
failures within scope; escalate unresolved blocking disputes and decisions that
require the user. Optional improvements accumulate for final human PR review;
they never interrupt execution, consume rounds, or enter scope automatically.

Do not create separate user-owned chats as an implementation detail. Use subagent
coordination tools available in the current session. If required role loading or
tools are unavailable, report the limitation and continue independent preparation;
do not claim the full workflow ran.

## Deliver and track

Preserve each agent's findings and actual results in the task and PR. Record
check commands/results, evidence, head reviewed, correction count, and remaining
blockers. Never convert an unperformed check into a pass. If tracking edits alter
the delivered head, arrange review and checks for those changes before declaring
the current PR ready; administrative edits do not reset correction rounds.

Deliver either **ready for human review and manual merge** or **blocked, user
direction required**. Include the PR, resulting behavior, acceptance coverage,
checks, review conclusion, rounds used, optional suggestions, limitations, and
any concrete decision needed. Readiness requires completed required validation
and no unresolved blockers; it is not a guarantee that no defects exist.

For visual work, ensure the PR description displays desktop screenshots and
mobile screenshots when responsive behavior applies, with state, viewport and
source commit labels. Follow the contract's
[visual evidence requirements](../development-workflow.md#visual-pr-evidence),
including refreshed captures after visual corrections, attribution of live checks
and removal of throwaway test artifacts before delivery. Require captures in a
temporary directory outside the repository and GitHub attachments displayed inline.
Verify the saved PR attachment URLs and retrieval before temporary-file cleanup
and ready handoff. Do not accept new delivery screenshots committed to the project
or source commits used to host them; preserve historical evidence and design references.

Before ready delivery, mark task and index `done` in the feature branch after
required checks and independent review pass. Include that tracking commit in final
review. Explicitly report human approval and manual merge as pending; GitHub tracks
them. No post-merge status commit or automatic monitor is needed. Keep blocked work
`in_progress`; reopen a delivered task if new blockers or requested changes require
implementation. Follow the direct-acceptance path for documentation when applicable.

## Instruction loading and native availability

Open Codex with the repository `my-clinics` as its working directory; starting
only in its parent folder does not discover this repository's `AGENTS.md`.
`AGENTS.md` is discovered automatically; this file is read through its explicit
routing instruction, rather than automatically injected as a native custom agent.
Use a fresh run to verify loading. Check the root instruction with
`codex debug prompt-input` and exercise this role with a read-only assignment.
Do not expose raw prompt dumps or private configuration in evidence.

Native implementer and reviewer configuration is validated in the
[workflow history](../milestones/milestone-00-development-workflow/workflow-history.md#role-configuration-and-acceptance-notes)
and linked role validation reports. Verify role availability in the active session
before dispatching; configuration files alone do not prove a role has loaded.

Sources: [Codex instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
and [subagent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents).
