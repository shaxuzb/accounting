import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const pageSource = readFileSync(
  new URL(
    "../src/modules/bank/pages/statement/screens/BankStatementImportPage.tsx",
    import.meta.url,
  ),
  "utf8",
);
const cardSource = readFileSync(
  new URL(
    "../src/modules/bank/pages/statement/components/BankStatementCard.tsx",
    import.meta.url,
  ),
  "utf8",
);
const modalSource = readFileSync(
  new URL(
    "../src/modules/bank/pages/statement/components/MissingCounterpartyModal.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("uploaded statement replaces the bank selector with date and classification filters", () => {
  assert.match(
    pageSource,
    /\{cards\.length > 0 \? \(\s*<>\s*<Segmented[\s\S]*?<DateRangeFilter[\s\S]*?<SelectFilter[\s\S]*?\) : \(\s*<div[\s\S]*?<SelectCustom/s,
  );
});

test("review-only content stays hidden before a statement is uploaded", () => {
  assert.match(
    pageSource,
    /\{cards\.length > 0 && \(\s*<>\s*<div className="space-y-3">\s*<Card className="border border-border p-4">/s,
  );
  assert.match(
    pageSource,
    /\{cards\.length > 0 && \(\s*<>[\s\S]*?\{filteredCardViews\.length > 0 \?/s,
  );
  assert.doesNotMatch(pageSource, /t\("bank\.import\.statements"\)/);
  assert.doesNotMatch(pageSource, /t\("bank\.import\.status"\)/);
});

test("operation status is not rendered as a table column", () => {
  assert.doesNotMatch(cardSource, /title: t\("bank\.import\.operationStatus"\)/);
});

test("save stays disabled without valid rows and always opens confirmation before posting", () => {
  assert.match(pageSource, /disabled=\{!validOperations\.length\}/);
  assert.match(
    pageSource,
    /Modal\.confirm\(\{[\s\S]*?onOk: persistOperations/s,
  );
  assert.doesNotMatch(
    pageSource,
    /if \(invalidNewOperationCount > 0\) \{\s*Modal\.confirm/s,
  );
  assert.match(pageSource, /\{ operations: validOperations \}/);
});

test("a transaction is not ready until its accounting fields are completed", () => {
  assert.match(
    pageSource,
    /!toValidNumber\(card\.bankChartAccountId\)[\s\S]*!toValidNumber\(transaction\.offsetAccountId\)[\s\S]*!toValidNumber\(transaction\.classificationCategoryId\)/,
  );
});

test("counterparty modal keeps editable fields in one aligned row", () => {
  assert.match(
    modalSource,
    /className="\[&_.ant-table-cell\]:whitespace-nowrap"/,
  );
  assert.match(modalSource, /scroll=\{\{ y: 460, x: "max-content" \}\}/);
});

test("statement card shows currency name and omits repeated header status tags", () => {
  assert.match(cardSource, /currencyName/);
  assert.doesNotMatch(cardSource, /t\("bank\.import\.newOperations"\)/);
  assert.doesNotMatch(cardSource, /t\("bank\.import\.existingOperations"\)/);
  assert.doesNotMatch(cardSource, /t\("bank\.messages\.bankAccountMissing"\)/);
  assert.doesNotMatch(cardSource, /t\("bank\.messages\.requiresReview"\)/);
});
