# Business Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a production-ready dashboard page wired to the documented BusinessDashboard APIs.

**Architecture:** Keep the existing `$axiosPrivate` transport and Redux organization/auth context. Add typed dashboard API/query utilities, a React Query-backed page, and focused visual widgets with isolated loading/error/source states. The overview endpoint is the first paint; child endpoints remain available for widget-level refresh and future expansion.

**Tech Stack:** React 19, TypeScript, React Router, Ant Design, Tailwind CSS, TanStack React Query, lucide-react, existing i18n and theme tokens.

**Spec:** `docs/superpowers/specs/2026-09-03-business-dashboard-design.md`

## Global Constraints

- Use `GET` only; dashboard flow performs no writes.
- Send headers through `$axiosPrivate`; do not duplicate token or organization handling.
- Serialize arrays as repeated query keys and send only endpoint-specific filters.
- Render `null` overdue and empty series as unavailable/empty, never guessed zero/chart data.
- Preserve existing uncommitted changes outside dashboard files.
- Keep dashboard responsive, keyboard accessible, and usable in light/dark themes.

---

### Task 1: Dashboard contract utilities

**Files:**
- Create: `src/modules/dashboard/types.ts`
- Create: `src/modules/dashboard/api.ts`
- Create: `tests/dashboard.api.test.ts`

**Interfaces:**
- Produces `DashboardOverview`, child response types, `DashboardFilters`, `buildOverviewQuery`, `buildCashQuery`, `buildElectronicDocumentsQuery`, `buildTaxSummaryQuery`, and `dashboardService`.

- [ ] **Step 1: Write failing tests** for repeated arrays, omission of empty values, and endpoint-specific filter isolation.
- [ ] **Step 2: Run `node --experimental-strip-types --test tests/dashboard.api.test.ts` and confirm the missing module/query functions fail.
- [ ] **Step 3: Add typed response models and query builders matching the supplied guide.
- [ ] **Step 4: Add `dashboardService` methods using `$axiosPrivate.get` and the correct `/dashboard/...` paths.
- [ ] **Step 5: Run the focused test and confirm it passes.

### Task 2: Status, formatting, and filter helpers

**Files:**
- Create: `src/modules/dashboard/utils.ts`
- Create: `tests/dashboard.utils.test.ts`

**Interfaces:**
- Produces `getSourceStatusMeta`, `formatDashboardAmount`, `formatDashboardCount`, `isUnavailableAmount`, and default date filter helpers.

- [ ] **Step 1: Write failing tests for `PARTIAL`, `NOT_AVAILABLE`, nullable overdue, and UZS amount formatting.
- [ ] **Step 2: Run the focused test and confirm failure on missing helpers.
- [ ] **Step 3: Implement helpers using Intl formatting and theme-safe status metadata.
- [ ] **Step 4: Run the focused test and confirm it passes.

### Task 3: Dashboard page and widgets

**Files:**
- Create: `src/modules/dashboard/components/DashboardHeader.tsx`
- Create: `src/modules/dashboard/components/SourceStatusBadge.tsx`
- Create: `src/modules/dashboard/components/MetricCard.tsx`
- Create: `src/modules/dashboard/components/CashSummaryWidget.tsx`
- Create: `src/modules/dashboard/components/ReceivablesPayablesWidget.tsx`
- Create: `src/modules/dashboard/components/TaxSummaryWidget.tsx`
- Create: `src/modules/dashboard/components/ElectronicDocumentsWidget.tsx`
- Create: `src/modules/dashboard/components/UnavailableWidget.tsx`
- Create: `src/modules/dashboard/hooks/useDashboard.ts`
- Modify: `src/modules/dashboard/dashboard.tsx`

**Interfaces:**
- `Dashboard` renders the page.
- `useDashboard(filters)` returns overview data, loading/error state, filter state, and a refresh function.
- Widgets accept typed child response objects and render independently.

- [ ] **Step 1: Add page-level tests or source-level UI assertions for headings, unavailable tasks, and nullable overdue text.
- [ ] **Step 2: Run the focused test and confirm the new UI assertions fail.
- [ ] **Step 3: Implement `useDashboard` with React Query, normalized filter keys, overview query, and refresh behavior.
- [ ] **Step 4: Implement header/filter controls and the cash widget with totals and account table.
- [ ] **Step 5: Implement receivable/payable, tax, electronic-document, and unavailable widgets using the source-status rules.
- [ ] **Step 6: Run the focused dashboard tests and confirm they pass.

### Task 4: Route, menu, and localization integration

**Files:**
- Create: `src/modules/dashboard/routes.tsx`
- Modify: `src/app/router/index.tsx`
- Modify: `src/app/config/menuPermissions.tsx`
- Modify: `src/config/locales/uz.json`
- Modify: `src/config/locales/ru.json`
- Modify: `src/config/locales/en.json`

**Interfaces:**
- Produces a `/main/dashboard` route protected by `DASHBOARD_VIEW` and a sidebar item that is visible only to users with that permission.

- [ ] **Step 1: Add route/menu source assertions for path and permission code.
- [ ] **Step 2: Run the focused test and confirm missing route/menu integration fails.
- [ ] **Step 3: Add route, permission constant, menu icon/title, and localized dashboard copy.
- [ ] **Step 4: Run tests and confirm route/menu assertions pass.

### Task 5: Full verification and visual review

**Files:**
- Modify only dashboard files if verification exposes defects.

- [ ] **Step 1: Run `npm run build`.
- [ ] **Step 2: Run `npm run lint`.
- [ ] **Step 3: Run `node --experimental-strip-types --test tests/dashboard.api.test.ts tests/dashboard.utils.test.ts`.
- [ ] **Step 4: Start the Vite app if needed and inspect desktop/mobile dashboard states with an authenticated session or safe empty/error states.
- [ ] **Step 5: Review `git diff --stat` and ensure unrelated pre-existing changes remain untouched.

