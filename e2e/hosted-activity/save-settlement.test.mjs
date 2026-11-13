import assert from "node:assert/strict";
import { test } from "node:test";
import { settleAndClean, waitForSettlement } from "./save-settlement.mjs";

test("cleanup waits for a delayed save beyond the browser assertion deadline", async () => {
  const save = Promise.withResolvers();
  assert.equal(await waitForSettlement(save.promise, 1), "unresolved");

  let committed = false;
  const cleanup = settleAndClean(save.promise, 1000, {
    confirmSave: () => committed,
    removeRows: () => {
      assert.ok(committed, "cleanup must begin after the save settles");
      return 1;
    },
  });
  await Promise.resolve();
  committed = true;
  save.resolve("settled");

  assert.deepEqual(await cleanup, {
    submission: "settled",
    acknowledged: true,
    removed: 1,
    cleanup: "verified",
  });
});

test("empty cleanup reads leave an ambiguous save unresolved", async () => {
  const pending = new Promise(() => {});
  const disconnected = Promise.resolve("unresolved");
  for (const settlement of [pending, disconnected]) {
    assert.deepEqual(
      await settleAndClean(settlement, 1, {
        confirmSave: () => assert.fail("transport is unresolved"),
        removeRows: () => 0,
      }),
      {
        submission: "unresolved",
        acknowledged: false,
        removed: 0,
        cleanup: "unresolved",
      },
    );
  }
});

test("a successful HTTP response with no app acknowledgement leaves empty reads unresolved", async () => {
  const result = await settleAndClean(Promise.resolve("settled"), 1000, {
    confirmSave: () => false,
    removeRows: () => 0,
  });
  assert.deepEqual(result, {
    submission: "settled",
    acknowledged: false,
    removed: 0,
    cleanup: "unresolved",
  });
});
