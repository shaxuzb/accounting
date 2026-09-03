import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("dashboard route is protected by DASHBOARD_VIEW", async () => {
  const source = await read("../src/modules/dashboard/routes.tsx");

  assert.match(source, /dashboardPermissions/);
  assert.match(source, /path:\s*["']dashboard["']/);
  assert.match(source, /PermissionCard/);
});

test("dashboard page exposes API-driven sections and unavailable task state", async () => {
  const source = await read(
    "../src/modules/dashboard/pages/dashboard/screens/DashboardPage.tsx",
  );

  assert.match(source, /CashSummaryWidget/);
  assert.match(source, /ElectronicDocumentsWidget/);
  assert.match(source, /UnavailableWidget/);
  assert.match(source, /useDashboard/);
});

test("dashboard menu item uses dashboard permission", async () => {
  const source = await read("../src/app/config/menuPermissions.tsx");

  assert.match(source, /dashboardPermissions/);
  assert.match(source, /path:\s*["']dashboard["']/);
  assert.match(source, /title:\s*["']menu\.dashboard["']/);
});

test("dashboard hook loads the widget endpoints alongside overview", async () => {
  const source = await read("../src/modules/dashboard/hooks/useDashboard.ts");
  const queryHookSource = await read(
    "../src/modules/dashboard/hooks/useGetDashboard.ts",
  );
  const serviceSource = await read(
    "../src/modules/dashboard/services/dashboardService.ts",
  );

  assert.match(source, /useGetDashboard/);
  assert.match(queryHookSource, /getDashboardBundle/);
  assert.match(serviceSource, /getCash/);
  assert.match(serviceSource, /getReceivablesPayables/);
  assert.match(serviceSource, /getElectronicDocuments/);
  assert.match(serviceSource, /getTaxSummary/);
  assert.match(serviceSource, /Promise\.allSettled/);
});

test("dashboard documents widget keeps real-data states and direction controls", async () => {
  const source = await read(
    "../src/modules/dashboard/components/ElectronicDocumentsWidget.tsx",
  );

  assert.doesNotMatch(source, /amountUnavailable/);
  assert.match(source, /directionFilter/);
  assert.match(source, /displayedStatusItems/);
  assert.match(source, /directionTotal/);
  assert.match(source, /relationships\.incoming\.statusCounts/);
  assert.match(source, /relationships\.outgoing\.statusCounts/);
  assert.match(source, /Segmented<DirectionFilter>/);
  assert.match(source, /typeCounts/);
});

test("relationships widget presents technical statuses as user-facing labels", async () => {
  const source = await read(
    "../src/modules/dashboard/components/RelationshipsWidget.tsx",
  );

  assert.match(source, /getDashboardDocumentStatusLabel/);
  assert.match(source, /statusLabels/);
  assert.match(source, /rounded-full/);
});

test("main layout lets dashboard use the full width after sidebar collapse", async () => {
  const layoutSource = await read("../src/app/layouts/MainLayout.tsx");
  const sidebarSource = await read("../src/app/layouts/Sidebar.tsx");
  const dashboardSource = await read(
    "../src/modules/dashboard/pages/dashboard/screens/DashboardPage.tsx",
  );

  assert.match(layoutSource, /w-full min-w-0 flex-1/);
  assert.match(sidebarSource, /w-\[280px\]/);
  assert.match(sidebarSource, /shrink-0/);
  assert.match(dashboardSource, /w-full min-w-0 pb-8/);
  assert.doesNotMatch(dashboardSource, /max-w-/);
});
