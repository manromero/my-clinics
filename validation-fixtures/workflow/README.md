# Working workflow exercise fixture

This exercise artifact stays outside production imports. Review and correct
[`count.mjs`](count.mjs) itself; the runner imports that file directly.

`countAtOrBelow(values, limit)` counts finite numbers less than or equal to a
finite numeric limit. Inputs contain at most eight finite numbers. Count repeated
boundary values, support zero and negatives, return zero for empty input, exclude
values above the limit, and preserve the input array. Input validation and
performance changes are outside scope.

The initial implementation was seeded from
[`reviewer/initial.mjs`](../reviewer/initial.mjs), preserving its intentional strict
comparison defect. At initial commit `67215644845c514ccac788f8dd59113358d0e21e`,
`[1, 2, 2, 3]` with limit `2` returned `1` rather than `3`. This was the initial
review blocker B01, not a product check failure. Correction round 1 edits this
working file to include equality; it does not select a prewritten corrected file.

Run from the repository root:

```bash
node validation-fixtures/workflow/check.mjs
```

The initial check exited `1`, reporting four boundary failures and two passing
cases. The corrected working implementation must exit `0` with all six cases
passing, including input preservation. See the
[workflow validation report](../../docs/milestones/milestone-00-development-workflow/workflow-validation.md)
for actual checks and review state. A JSDoc usage example remains an optional
suggestion for final human review; it is not an acceptance requirement.
