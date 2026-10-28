import assert from "node:assert/strict";
import { countAtOrBelow } from "./count.mjs";

const cases = [
  { name: "ordinary values", values: [1, 3, 5], limit: 4, expected: 2 },
  { name: "empty array", values: [], limit: 2, expected: 0 },
  { name: "exact equality", values: [2], limit: 2, expected: 1 },
  { name: "repeated boundary", values: [1, 2, 2, 3], limit: 2, expected: 3 },
  { name: "zero boundary", values: [-1, 0, 1], limit: 0, expected: 2 },
  { name: "negative boundary", values: [-3, -2, -1], limit: -2, expected: 2 },
];

let failures = 0;
for (const { name, values, limit, expected } of cases) {
  try {
    const original = [...values];
    const actual = countAtOrBelow(values, limit);
    assert.deepEqual(values, original);
    assert.equal(actual, expected);
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

console.log(
  `workflow: ${cases.length - failures}/${cases.length} cases passed`,
);
process.exitCode = failures === 0 ? 0 : 1;
