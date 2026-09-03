import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

const summarySource = read(
  "../src/modules/rental/pages/accruals/components/AccrualSummaryCard.tsx",
);
const readonlySource = read(
  "../src/modules/rental/pages/accruals/components/readonly/AccrualReadonlyView.tsx",
);
const detailSource = read(
  "../src/modules/rental/pages/accruals/screens/AccrualDetailPage.tsx",
);
const itemsSource = read(
  "../src/modules/rental/pages/accruals/components/AccrualItemsTable.tsx",
);
const listSource = read(
  "../src/modules/rental/pages/accruals/screens/AccrualListPage.tsx",
);
const routesSource = read("../src/modules/rental/routes.tsx");

test("accrual readonly uses the same shared cards as rental contracts", () => {
  assert.match(summarySource, /DocumentSummary/);
  assert.doesNotMatch(summarySource, /Descriptions/);
  assert.match(readonlySource, /ReadonlyFieldGrid/);
  assert.match(readonlySource, /SectionCard/);
  assert.match(readonlySource, /actions/);
  assert.doesNotMatch(readonlySource, /<Row/);
});

test("accrual draft uses the shared bottom draft actions bar", () => {
  assert.doesNotMatch(detailSource, /AccrualActions/);
  assert.doesNotMatch(detailSource, /ArrowLeft/);
  assert.match(detailSource, /DraftActionsBar/);
  assert.match(detailSource, /AccrualDetailContent/);
});

test("accrual draft form is initialized from GET data and saving keeps it as draft", () => {
  assert.match(detailSource, /mapRentalAccrualToForm/);
  assert.match(detailSource, /enableReinitialize: true/);
  assert.doesNotMatch(detailSource, /useEffect/);
});

test("accrual confirmation saves edited values before posting", () => {
  assert.match(detailSource, /const persistDraft = async/);
  assert.match(detailSource, /await persistDraft\(formik\.values\)/);
  assert.match(detailSource, /await postMutation\.mutateAsync\(data\.id\)/);
  assert.doesNotMatch(
    detailSource,
    /onConfirm=\{\(\) =>\s*runAction\(\(\) => postMutation\.mutateAsync\(data\.id\)\)\}/,
  );
});

test("accrual drafts expose the same edit action as rental contracts", () => {
  assert.match(listSource, /customPath=\{`\/main\/rentals\/accruals\/edit\/\$\{record\.id\}`\}/);
  assert.match(listSource, /editCode: rentalAccrualPermissions\.update/);
  assert.match(listSource, /permission !== rentalAccrualPermissions\.update/);
  assert.match(routesSource, /path: "edit\/:id"/);
});

test("accrual edit route has an edit-specific page title", () => {
  const accrualRoutes = routesSource.slice(routesSource.indexOf('path: "accruals"'));
  const editRoute = accrualRoutes.match(
    /path: "edit\/:id"([\s\S]*?)handle: \{([\s\S]*?)\}/,
  )?.[2];

  assert.ok(editRoute, "Missing accrual edit route handle");
  assert.match(editRoute, /title: "rental\.accruals\.edit"/);
});

test("accrual draft rows expose an editable expense account field", () => {
  assert.match(itemsSource, /const editing = Boolean\(formik\)/);
  assert.match(itemsSource, /expandable=\{[\s\S]*?expandedRowRender/);
  assert.match(itemsSource, /<SelectCustom/);
});
