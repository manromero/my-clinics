import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const artifacts = "hosted-activity-results/artifacts";
const result = JSON.parse(
  readFileSync(`${artifacts}/probe-result.json`, "utf8"),
);
const trace = JSON.parse(
  readFileSync(`${artifacts}/probe-desktop.trace.json`, "utf8"),
);

assert.equal(result.status, "failed");
assert.equal(result.tests.length, 1);
assert.equal(result.tests[0].project, "desktop");
assert.equal(result.tests[0].status, "failed");
assert.equal(trace.probeTriggered, true);
assert.equal(trace.saveConfirmed, true);
assert.equal(trace.removed, 1);
assert.deepEqual(
  trace.steps
    .filter(({ result }) => result === "failed")
    .map(({ step }) => step),
  ["Deliberately fail after confirming a saved row"],
);
assert.equal(
  trace.steps.at(-1)?.step,
  "Remove only run-owned activity and verify absence",
);
assert.equal(trace.screenshot, true);
assert.ok(statSync(`${artifacts}/probe-desktop.png`).size > 0);
console.log(
  "The intentional failure produced diagnostics and the saved activity was removed.",
);
