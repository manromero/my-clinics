import assert from "node:assert/strict";

const version = process.argv[2];
if (version !== "initial" && version !== "corrected") {
  console.error(
    "Usage: node validation-fixtures/reviewer/check.mjs initial|corrected",
  );
  process.exit(2);
}

const { countAtOrBelow } = await import(`./${version}.mjs`);
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
    assert.equal(countAtOrBelow(values, limit), expected);
    assert.deepEqual(values, original);
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

console.log(
  `${version}: ${cases.length - failures}/${cases.length} cases passed`,
);
process.exitCode = failures === 0 ? 0 : 1;
