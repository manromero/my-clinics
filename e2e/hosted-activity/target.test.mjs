import assert from "node:assert/strict";
import { test } from "node:test";
import { approvedTarget, assertApprovedTarget } from "./target.mjs";

test("accepts only the approved synthetic project origin", () => {
  assert.doesNotThrow(() => assertApprovedTarget(approvedTarget));
  for (const url of [
    undefined,
    "https://unapproved.supabase.co",
    "http://lvqbrjybwstvdhaxyxyn.supabase.co",
    `${approvedTarget}.example.com`,
    `${approvedTarget}/rest/v1`,
    `${approvedTarget}?target=other`,
    `https://username@${new URL(approvedTarget).host}`,
  ]) {
    assert.throws(() => assertApprovedTarget(url), /exact approved synthetic/);
  }
});
