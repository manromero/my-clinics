import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkParity,
  checkTypes,
  organization,
  verifyTarget,
} from "./database-validation.mjs";

test("target guard rejects shared development, wrong organization and wrong name", () => {
  const name = "myclinics-validation-test";
  const project = {
    id: "abcdefghijklmnopqrst",
    name,
    organization_id: organization,
  };
  verifyTarget(project, name);
  assert.throws(() =>
    verifyTarget({ ...project, id: "lvqbrjybwstvdhaxyxyn" }, name),
  );
  assert.throws(() =>
    verifyTarget({ ...project, organization_id: "other" }, name),
  );
  assert.throws(() => verifyTarget({ ...project, name: "my-clinics" }, name));
});

test("freshness and parity fail on changed content without rewriting files", () => {
  checkTypes("generated", "generated");
  assert.throws(() => checkTypes("generated", "stale"));
  checkParity([{ name: "probe" }], [{ name: "probe" }]);
  assert.throws(() => checkParity([{ name: "probe" }], []));
});
