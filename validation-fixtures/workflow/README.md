# Working workflow exercise fixture

This exercise artifact stays outside production imports. Review and correct
[`count.mjs`](count.mjs) itself; the runner imports that file directly.

`countAtOrBelow(values, limit)` counts finite numbers less than or equal to a
finite numeric limit. Inputs contain at most eight finite numbers. Count repeated
boundary values, support zero and negatives, return zero for empty input, exclude
values above the limit, and preserve the input array. Input validation and
performance changes are outside scope.

The initial implementation is seeded from
[`reviewer/initial.mjs`](../reviewer/initial.mjs), preserving its intentional strict
comparison defect. For `[1, 2, 2, 3]` and limit `2`, it returns `1` rather than `3`.
This is the expected initial review blocker, not a product check failure.

Run from the repository root:

```bash
node validation-fixtures/workflow/check.mjs
```

Initially this exits `1`, reporting four boundary failures and two passing cases.
After the assigned real correction, the same command must exit `0` with all six
cases passing, including input preservation. Do not select an existing corrected
fixture to satisfy the correction. A JSDoc usage example is an optional suggestion
for final human review; it is not an acceptance requirement.
