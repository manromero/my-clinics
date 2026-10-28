# Task 03 — Validate workflow

Status: `done`

## Objective

Demonstrate that the configured roles can carry a user-assigned task through the
agreed workflow to a reviewable PR and manual user merge.

## Scope

- Use the representative task or exercise validated in Task 00.
- Exercise assignment, implementation, required checks, PR creation targeting
  `develop`, and separate review.
- Exercise coordinator readiness checks, branch setup, sourced task context,
  sequential delegation, correction counting, and ready/blocked final delivery.
- Demonstrate a blocking finding, a correction, and revalidation; use an exercise
  fixture rather than introducing defects into product changes.
- Demonstrate scope-question escalation and bounded correction rounds.
- Verify task statuses and the milestone index track the actual work.
- Record evidence, limitations, and final user handoff; wait for the user's PR
  review and manual merge.
- Before final delivery, move the representative exercise, desk walkthrough, and
  temporary setup notes from the operational contract into milestone historical
  records, preserving evidence and updating links. Keep the contract focused on
  everyday workflow rules, as agreed with the user after Task 00 review.

## Dependencies

- [Task 01 — Configure implementer](<task 01 - configure implementer.md>).
- [Task 02 — Configure reviewer](<task 02 - configure reviewer.md>).
- [Task 04 — Configure coordinator](<task 04 - configure coordinator.md>).
- User validation of the representative exercise and any external actions it
  requires under the workflow contract.

## Acceptance criteria

- The agreed workflow runs with three separate roles and preserves task scope.
- The final review after correction round 2 leads to coordinator delivery or
  escalation, never a third automatic correction.
- A PR targeting `develop` contains a clear change and validation description.
- Code, functional, and applicable visual reviews produce verifiable results.
- Blockers cause corrections and revalidation before final handoff.
- Missing evidence, scope ambiguities, and the correction-round limit produce
  the agreed user handoff instead of an unsupported clean result.
- The ready PR includes task/index `done` updates covered by final review; human
  approval and merge remain pending in GitHub. Blocked work stays `in_progress`.
- Human approval and manual merge remain the final user action in GitHub; the
  ready PR already includes the `done` update, without a post-merge status commit.

## Validation

Document the exercise, commands/checks, review findings, evidence, corrections,
PR link, and final result using the location agreed in Task 00. Report any steps
that could not be exercised. Check updated documentation formatting and links.

## Progress notes (chronological)

Started after verifying PR #3 merged into `develop`. Both native delegated roles
are available. The user authorized the global exercise and formatting the five
existing visual-reference files so required application checks can pass.

- Stage 1: native implementer `/root/task03_implementer` created the temporary UI
  and isolated working fixture; all four application checks passed. The fixture
  intentionally returned 2/6 passing at initial review; round 1 later fixed it.
- Permission handoff: native staging was denied at `.git/index.lock` and its
  sandbox could not validate GitHub credentials. The coordinator independently
  verified valid host credentials and performs the exact requested Git/PR
  publication through approved execution, recording that actor distinction.
- Initial native review of `0f2c20bd79b5feb08227ea9ec677a60114b37453` opened B01
  at `validation-fixtures/workflow/count.mjs:3`: strict comparison excludes equality;
  independent reproduction returned exit 1 and 2/6 passing. O01 (JSDoc example)
  remains optional for final human review. No other code or visual blockers found;
  all four application checks independently passed.
- Round 1 assigned to the retained implementer: edit the working fixture, rerun
  checks, and complete the originally planned route removal/history cleanup.
  The retained native reviewer subsequently verified the resulting new commit.
- Four policy handoffs were exercised as explicit simulations, not extra source
  defects or correction rounds. Native reviewer inspected screenshots and code;
  independent live browser access was unavailable. Live actions were performed
  by the coordinator and are recorded separately.
- Native re-review of `ecf50f1eb612edab8cc78aa81e2c477a44b8fb68` independently
  closed B01: runner unchanged, 6/6 passing; all app checks passed and `src` matches
  base. It opened B02 for conflicting current/historical publication statements
  in the report and history. Round 2 was assigned to the same implementer for
  evidence-documentation consistency only; no code or optional-suggestion edits.
- Final round 2 review of `be05e172ccf711a99edd409165bf242348b4bf69` closed B02:
  chronology, actor attribution and simulation labeling were independently verified.
  B01 remained closed; all 67 other tracked files were unchanged. Formatting,
  33 local targets/9 anchors, source identities and whitespace checks passed.
  No blockers remained; O01 (JSDoc usage example) was deferred as optional.
- Coordinator delivery records task/index `done` in this same PR after that clean
  review, with the administrative change subject to a narrow final recheck. Human
  approval and manual merge are tracked in [PR #4](https://github.com/manromero/my-clinics/pull/4).
  Agent validation is complete; human acceptance is not implied by `done`.
- Validation summary: fixture 6/6; lint, typecheck, format and production build
  passed independently at the round 1 evidence head. Round 2 and closing tracking
  change documentation only. Temporary route removal was verified in source/build
  and by the coordinator's live 404; the source matches the exercise base.
  See the [chronological report](workflow-validation.md) for captures and results.
- Material limitations: native sandbox publication required the approved host
  Git/PR handoff. Reviewer visual checks used captures, source and design references;
  live interactions were performed by the coordinator, not the reviewer.

## Execution context

- Branch: `feature/validate-workflow`, from updated `origin/develop`.
- Base: `1aa5a3f2c547b19b54f867112b6a64dea9f02b60`.
- Scope and criteria: [global exercise assignment](workflow-exercise.md).
- Readiness: approved three-role workflow, native definitions and GitHub access
  available; no product decisions missing. Normal usage is available again.
- References: `AGENTS.md`, operational contract, coordinator/native role files,
  architecture, Alexandria, and the activity screen's Stitch reference.
- One fresh native implementer and a separate fresh native reviewer receive
  selected context; retain both for this task's sequential handoffs.
- Coordinator owns task/index/evidence. Implementer owns assigned source changes,
  check results and delivery artifacts; reviewer independently verifies them.
- Correction rounds used: 2, both independently reviewed; no blockers remain.
  Fixture seeding was an intentional initial exercise
  condition, not a product defect or completed correction. Actual review/fix and
  revalidation must be recorded at distinct commits.
- Delivery: PR to `develop`; final `done` tracking and independent recheck before
  human approval. Never merge automatically.
