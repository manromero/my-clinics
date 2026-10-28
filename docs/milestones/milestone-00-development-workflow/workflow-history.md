# Milestone 00 — Workflow history

This record preserves accepted decisions, temporary setup notes and exercise
material moved from the operational [workflow contract](../../development-workflow.md)
during Task 03. These are historical observations and plans, not current progress
claims or additional operational requirements. The source contract and coordinator
notes are retained at commit `0f2c20bd79b5feb08227ea9ec677a60114b37453`.
Execution events and review evidence are in the [validation report](workflow-validation.md).

After PR #4 merged, the user requested removal of temporary test artifacts. The
fixtures, exercise assignment and six captures were removed from the current
tree; historical links resolve to immutable commit
`9f9d3c4aea998a013db46524d54f57682235d25a`. The accepted decisions, task records
and validation reports remain as milestone history. The user also approved the
visual-PR screenshot requirement in the operational contract and direct delivery
of this documentation/cleanup change to `develop`, without a separate review.

## Role configuration and acceptance notes

The contract opened with this status note before relocation:

Status: workflow decisions and documentation accepted by the user on 2026-10-28.
Task 00 is complete. The user subsequently approved a coordinator, implementer,
and reviewer. Coordinator configuration is complete in Task 04; native implementer
configuration is delivered through Task 01. Task 02 provides the native reviewer;
its [validation report](reviewer-validation.md)
separates local checks from native installation and runtime verification. The full
execution exercise remains Task 03 of
[Milestone 00](readme.md).

Its role-configuration paragraph recorded:

Project-scoped delegated role instructions are versioned under `.codex/agents/`.
Task 01 provides the native [`implementer`](../../../.codex/agents/implementer.toml);
Task 02 provides the native [`reviewer`](../../../.codex/agents/reviewer.toml), with actual
loading and behavior evidence recorded in its validation report.
Select the configured role when dispatching rather
than relying on a generic worker's name. Verify actual loading; file existence alone is insufficient.
If native loading is unavailable, obtain agreement on explicit-instruction fallback
before claiming configuration complete. Bootstrap review of coordinator setup may
use a separate agent explicitly instructed with this contract; label it as such,
without claiming delegated role configuration or full workflow validation.
A request not to edit is a role boundary, not a separate security sandbox.

The original coordinator routing paragraph identified activation through repository
`AGENTS.md` in Task 04. Its direct-documentation acceptance example recorded:

Task 00 uses this direct-documentation
path; the user accepted the resulting document on 2026-10-28, completing Task 00.

The coordinator's setup section contained the following bootstrap-specific notes:

Task 01 records native implementer loading; Task 02's
[reviewer validation report](reviewer-validation.md)
distinguishes local configuration checks from native installation and runtime
verification. Verify role availability in a fresh session before dispatching.
Complete configuration validation without pretending an unavailable role has loaded.
An independent subagent may review this bootstrap configuration using explicit
instructions and the contract; record that as bootstrap review, not as validation
of native implementer/reviewer loading. Task 03 validates the full workflow.

## Representative exercise for Task 03

The following is the historical exercise plan from the contract at
`0f2c20bd79b5feb08227ea9ec677a60114b37453`, preserved as written. Its future-tense
instructions describe that plan, not the present execution state.

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
   blockers allow the coordinator to include a `done` task/index update in final
   review and deliver the PR for human acceptance.
5. If a required check cannot run, the result stays incomplete. If behavior is
   ambiguous or a blocker is disputed, the user receives the concrete decision.
   If blockers persist through round 2, further corrections await user direction.
6. GitHub records human approval and merge; the merged PR already contains the
   `done` tracking update. These steps will be exercised in Task 03.

## Technical baseline and remaining work

The following setup observations and remaining-work notes were recorded in the
contract at `0f2c20bd79b5feb08227ea9ec677a60114b37453`. They are historical text,
not a statement of live access, settings or task status.

Verified on 2026-10-28: `main` and remote `develop` both pointed to `92de852`;
Git push succeeded. This repository uses Git's `schannel` TLS backend. GitHub CLI
2.103.3 was installed and authenticated as `manromero` with repository admin
access. The active desktop session could invoke it at
`C:/Program Files/GitHub CLI/gh.exe`; PATH discovery still required a refreshed
environment. `main` was the default branch; both branches were unprotected, all
three merge methods were enabled, and there were no open PRs.

These are observations, not permanent guarantees. Recheck access and remote state
when starting work. At that baseline, no test PR had been created, and branch
protection, merge strategy and role loading had not been configured or validated.
The [coordinator](coordinator-validation.md)
and [implementer](implementer-validation.md)
records describe subsequent loading checks. Task 02's
[reviewer report](reviewer-validation.md)
records native installation and runtime checks; full workflow validation remains
the exercise in Task 03.

The user approved coordination, the two-round limit, evidence locations, and the
representative exercise on 2026-10-28. Merge strategy and branch protections remain
open decisions and do not block writing or configuring the role instructions.

Later on the same date, the user approved a primary coordinator and separate
implementer/reviewer agents, followed by explicit authorization to update this
contract and configure the coordinator. This supersedes the original combined
implementer/coordinator role; the two-round budget and manual merge remain intact.

The user subsequently approved marking tasks `done` in the deliverable PR after
agent work and review complete, with human acceptance/merge tracked in GitHub.
This supersedes the original post-merge status update rule. Task 04's historical
post-merge closure remains recorded as performed under the earlier rule.

Reference: [official Codex subagent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents).

## Temporary UI source archive

The temporary route was implemented and published at source commit
[`67215644845c514ccac788f8dd59113358d0e21e`](https://github.com/manromero/my-clinics/commit/67215644845c514ccac788f8dd59113358d0e21e).
Its original [`src/app/workflow-demo/page.tsx`](https://github.com/manromero/my-clinics/blob/67215644845c514ccac788f8dd59113358d0e21e/src/app/workflow-demo/page.tsx)
has Git blob `7e63765858000c4c2d75cb4d82ad5cf963207eec`. Commit history preserves
the source without leaving a compiled archive in the application. The
[coordinator captures and observations](workflow-validation.md#coordinator-live-ui-evidence)
preserve the running result. Initial review used report head
`0f2c20bd79b5feb08227ea9ec677a60114b37453` with that same UI blob. The root
coordinator published route removal and the actual fixture correction in commit
`23cfb67f767cf9d2d0de4c26e68360f8f614dbe8`, then observed the known temporary
URL return 404 in a fresh local browser tab and stopped the dev server. The
[retirement capture](https://github.com/manromero/my-clinics/blob/9f9d3c4aea998a013db46524d54f57682235d25a/docs/milestones/milestone-00-development-workflow/evidence/workflow-route-removed.jpg) records that local
observation; it is not a deployment or active-endpoint claim. The same native
reviewer independently verified the correction/removal at evidence head
`ecf50f1eb612edab8cc78aa81e2c477a44b8fb68` and closed B01. That review opened
B02 for inconsistent historical/progress prose, addressed in the documentation-only
round 2 handoff recorded in the validation report. Task status is owned by Task 03
and the milestone index, with approval and merge recorded in GitHub.
