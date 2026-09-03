import assert from "node:assert/strict";
import test from "node:test";
import {
  isRentalCancelled,
  isRentalDraft,
  isRentalPosted,
} from "../src/modules/rental/shared/constants/statuses.ts";

test("rental status helpers accept numeric status values from API responses", () => {
  assert.equal(isRentalDraft(1), true);
  assert.equal(isRentalPosted(2), true);
  assert.equal(isRentalCancelled(3), true);
});

test("rental status helpers accept string status values from API responses", () => {
  assert.equal(isRentalDraft("1"), true);
  assert.equal(isRentalPosted("2"), true);
  assert.equal(isRentalCancelled("3"), true);
});
