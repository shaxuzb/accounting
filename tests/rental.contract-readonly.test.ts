import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const readonlySource = readFileSync(
  new URL(
    "../src/modules/rental/pages/contracts/components/readonly/ContractReadonlyView.tsx",
    import.meta.url,
  ),
  "utf8",
);

const cashReadonlySource = readFileSync(
  new URL(
    "../src/modules/cashoperation/components/CashReadonlyLayout.tsx",
    import.meta.url,
  ),
  "utf8",
);

const detailPageSource = readFileSync(
  new URL(
    "../src/modules/rental/pages/contracts/screens/ContractDetailPage.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("rental readonly uses the shared document and field-card architecture", () => {
  assert.match(readonlySource, /DocumentSummary/);
  assert.match(readonlySource, /ReadonlyFieldGrid/);
  assert.match(readonlySource, /SectionCard/);
  assert.doesNotMatch(readonlySource, /Descriptions/);
});

test("cash readonly reuses the shared field-card component", () => {
  assert.match(cashReadonlySource, /ReadonlyFieldGrid/);
});

test("rental readonly keeps cancellation in the bottom action bar", () => {
  assert.doesNotMatch(detailPageSource, /ContractActions/);
  assert.doesNotMatch(detailPageSource, /ArrowLeft/);
  assert.match(detailPageSource, /<ContractReadonlyView data=\{data\} \/>/);
  assert.match(detailPageSource, /<DraftActionsBar/);
  assert.match(detailPageSource, /canSave=\{false\}/);
  assert.match(detailPageSource, /canConfirm=\{false\}/);
  assert.match(detailPageSource, /onCancelDocument=/);
});
