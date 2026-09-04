import assert from "node:assert/strict";
import test from "node:test";

import { normalizeBankStatements } from "../src/modules/bank/pages/statement/utils/normalizeBankStatement.ts";
import {
  isExistingBankOperation,
  isImportableBankOperation,
} from "../src/modules/bank/pages/statement/utils/bankImportRules.ts";

test("normalizes numeric operation flags so operation tabs can separate rows", () => {
  const [card] = normalizeBankStatements(
    [
      {
        transactions: [
          { date: "2026-01-01", amount: 100, isNewOperation: 1 },
          { date: "2026-01-02", amount: 200, isNewOperation: 0 },
        ],
      },
    ],
    "statement.xlsx",
  );

  assert.ok(card);
  assert.equal(isImportableBankOperation(card.transactions[0]), true);
  assert.equal(isExistingBankOperation(card.transactions[0]), false);
  assert.equal(isExistingBankOperation(card.transactions[1]), true);
  assert.equal(isImportableBankOperation(card.transactions[1]), false);
});
