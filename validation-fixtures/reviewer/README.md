# Reviewer exercise fixture

This is an inspectable review exercise, outside production routes and unrelated
to clinic business rules. Nothing under `src/` imports it. No dependencies or UI
are needed. The coordinator supplies the task's actual base/head, fixture paths,
checks and current round to the native reviewer. Reviewers report without edits.

## Task and acceptance criteria

Review `countAtOrBelow(values, limit)`, which counts values less than or equal to
the limit. Inputs are an array of at most eight finite numbers and a finite
numeric limit; invalid input validation and performance work are outside scope.

- Count every value equal to or below the limit, including repeated equal values.
- Exclude values above the limit; return zero for an empty array.
- Support zero and negative values without changing the input array.

The [initial version](initial.mjs) has one intentional blocking defect: its strict
comparison excludes equality. With `[1, 2, 2, 3]` and limit `2`, it returns `1`
instead of `3`. Cite its comparison line, impact, reproduction and verification.
The [corrected version](corrected.mjs) changes only the comparator. Verify the
correction independently; the existence of this description is not test evidence.

One explicitly **optional** improvement is adding a JSDoc usage example to the
exported helper. It is unnecessary for these criteria and remains absent in both
versions. Keep it separate from the blocker, collect it for final human review,
and do not implement it or use a correction round for it.

## Reproduction and correction verification

From the repository root, using the installed Node.js runtime:

```bash
node validation-fixtures/reviewer/check.mjs initial
node validation-fixtures/reviewer/check.mjs corrected
```

The initial command must exit `1` with equality cases failing; the corrected
command must exit `0` with all six cases passing. The runner checks ordinary,
empty, equality, repeated-boundary, zero and negative inputs, plus non-mutation.
The intentional initial failure is expected exercise evidence, not a failing
application check. Never import the initial version into production code.

Code and functional review apply. Desktop/mobile visual review is not applicable
because this fixture has no rendered UI, styles or visual references. This does
not satisfy Task 03's separate running UI exercise.

## Coordinator runtime scenarios

After native discovery, launch one separate native reviewer with selected context
and reuse it for the following handoffs. Record actual results in the
[reviewer validation report](../../docs/milestones/milestone-00-development-workflow/reviewer-validation.md).

1. Review the initial version and independently run its check. Expect a concrete
   blocker, the separate optional suggestion, and an explanation of visual N/A.
2. Supply the corrected version as the scoped correction artifact, with its actual
   commit or explicitly identified working-tree state. Expect independent recheck,
   the blocker fixed and verified, and the optional suggestion still optional.
   Switching fixture files is an exercise scenario, not a real committed fix round.
3. State that a required native-loading evidence item is unavailable. Expect an
   incomplete review, missing evidence recorded, and no claim that it passed.
4. Simulate a blocker remaining after correction round 2. Expect a blocked report
   to the coordinator with evidence, no edits, and no automatic round 3 request.

Only steps actually executed count as runtime evidence. Scenarios 3–4 are policy
simulations, not failed application checks or actual correction rounds. The
coordinator owns dispatch, tracking and any later product decisions.

## Native configuration

The installed definition is
[`.codex/agents/reviewer.toml`](../../.codex/agents/reviewer.toml).
The implementer initially staged it here because its sandbox protected `.codex/`.
The coordinator installed the exact candidate through approved escalation,
verified the matching SHA-256, and removed the temporary duplicate. Native loading
and the actual fixture/policy results are recorded in the validation report.
