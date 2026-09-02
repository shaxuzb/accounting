# Rental Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the rental contracts and rental accrual documents as one settings-style module integrated with the existing accounting UI, routing, permissions, and API client.

**Architecture:** Add `src/modules/rental` with self-contained `pages/contracts` and `pages/accruals` areas. Each area owns its `constants/{permissions,queryKeys,endpoints}.ts`, API service, hooks, types, components, and screens; only strictly shared rental status/helpers go in `rental/shared`.

**Tech Stack:** React 19, TypeScript, React Router 7, TanStack Query 5, Ant Design 6, Formik/Yup, Axios, i18next, lucide-react, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-02-rental-module-design.md`

## Global Constraints

- Both resources remain under one `src/modules/rental` module.
- Permissions, query keys, and endpoints live under each resource's own `constants/` directory.
- Rental request bodies never include `organizationId`; Axios supplies organization and language headers.
- UI must reuse existing accounting components and route/workspace patterns.
- Status action logic uses status IDs `1`, `2`, and `3`, not localized status names.
- Calculated accrual amounts are displayed from backend responses and never calculated or sent by the frontend.

### Task 1: Lock request contracts with focused tests

**Files:**
- Create: `tests/rental.contracts.test.ts`
- Create: `src/modules/rental/pages/contracts/constants/endpoints.ts`
- Create: `src/modules/rental/pages/contracts/constants/queryKeys.ts`
- Create: `src/modules/rental/pages/accruals/constants/endpoints.ts`
- Create: `src/modules/rental/pages/accruals/constants/queryKeys.ts`
- Create: `src/modules/rental/pages/contracts/utils/payload.ts`
- Create: `src/modules/rental/pages/accruals/utils/payload.ts`

**Interfaces:**
- Endpoint constants expose list/detail/create/update/delete/action paths with `(id: string | number)` functions.
- Query-key constants expose `all`, `list(params?)`, and `detail(id)` factories.
- Payload helpers omit organization IDs and calculated accrual amounts.

- [ ] **Step 1: Write failing tests** for all endpoint paths, contract object ID preservation, and accrual update payload field filtering.
- [ ] **Step 2: Run** `node --experimental-strip-types --test tests/rental.contracts.test.ts`; confirm the missing-module failure is caused by the new feature not existing.
- [ ] **Step 3: Implement** the constants and pure payload helpers.
- [ ] **Step 4: Run** the focused test and confirm it passes.

### Task 2: Add domain types, permissions, API services, and hooks

**Files:**
- Create: `src/modules/rental/pages/contracts/types/type.ts`
- Create: `src/modules/rental/pages/contracts/types/form.ts`
- Create: `src/modules/rental/pages/contracts/types/schema.ts`
- Create: `src/modules/rental/pages/contracts/constants/permissions.ts`
- Create: `src/modules/rental/pages/contracts/api.ts`
- Create: `src/modules/rental/pages/contracts/hooks/*.ts`
- Create: `src/modules/rental/pages/accruals/types/type.ts`
- Create: `src/modules/rental/pages/accruals/types/form.ts`
- Create: `src/modules/rental/pages/accruals/types/schema.ts`
- Create: `src/modules/rental/pages/accruals/constants/permissions.ts`
- Create: `src/modules/rental/pages/accruals/api.ts`
- Create: `src/modules/rental/pages/accruals/hooks/*.ts`

**Interfaces:**
- Contract services cover list/detail/create/update/delete/activate/cancel.
- Accrual services cover list/detail/update/delete/generateDue/post/cancel.
- Hooks invalidate resource list/detail keys after mutations.
- List services normalize documented pagination into `Paginated<T>`.

- [ ] **Step 1:** Define request, response, object, item, and pagination types from the attached API documentation.
- [ ] **Step 2:** Add each resource's permission constants using the documented permission strings.
- [ ] **Step 3:** Implement Axios service methods and response normalization.
- [ ] **Step 4:** Implement one hook per query/mutation, including invalidation for each mutation.
- [ ] **Step 5:** Run `npm run build` and the focused tests; fix type errors before screens.

### Task 3: Build the rental shared UI primitives

**Files:**
- Create: `src/modules/rental/shared/constants/statuses.ts`
- Create: `src/modules/rental/shared/components/RentalStatusBadge.tsx`
- Create: `src/modules/rental/shared/components/RentalAccountSelect.tsx`
- Create: `src/modules/rental/shared/utils/formatters.ts`

**Interfaces:**
- Status constants map numeric IDs to stable domain names.
- Account select uses existing `SelectCustom` and active chart-account options.
- Formatters delegate to existing date/number utilities.

- [ ] **Step 1:** Add focused tests for status classification and stable account option labels.
- [ ] **Step 2:** Run the focused tests and confirm the new helpers fail before implementation.
- [ ] **Step 3:** Implement the helpers using existing UI primitives.
- [ ] **Step 4:** Run tests and build.

### Task 4: Implement contract screens and components

**Files:**
- Create: `src/modules/rental/pages/contracts/components/ContractForm.tsx`
- Create: `src/modules/rental/pages/contracts/components/ContractObjectTable.tsx`
- Create: `src/modules/rental/pages/contracts/components/ContractActions.tsx`
- Create: `src/modules/rental/pages/contracts/components/ContractDetailContent.tsx`
- Create: `src/modules/rental/pages/contracts/screens/ContractListPage.tsx`
- Create: `src/modules/rental/pages/contracts/screens/ContractFormPage.tsx`
- Create: `src/modules/rental/pages/contracts/screens/ContractDetailPage.tsx`

- [ ] **Step 1:** Implement the list with documented search/status/date filters, pagination, status badge, permission-aware actions, and add button.
- [ ] **Step 2:** Implement the form with lessor identity validation, date validation, dynamic objects, type select, account selects, and backend-safe payload mapping.
- [ ] **Step 3:** Implement detail and status actions with `activate` and `cancel` confirmation flows.
- [ ] **Step 4:** Run the focused test and `npm run build`; resolve screen typing and navigation issues.

### Task 5: Implement accrual screens and components

**Files:**
- Create: `src/modules/rental/pages/accruals/components/AccrualItemsTable.tsx`
- Create: `src/modules/rental/pages/accruals/components/AccrualActions.tsx`
- Create: `src/modules/rental/pages/accruals/components/GenerateDueModal.tsx`
- Create: `src/modules/rental/pages/accruals/components/AccrualDetailContent.tsx`
- Create: `src/modules/rental/pages/accruals/screens/AccrualListPage.tsx`
- Create: `src/modules/rental/pages/accruals/screens/AccrualDetailPage.tsx`

- [ ] **Step 1:** Implement the list with contract/status/date/search filters and generate-due action.
- [ ] **Step 2:** Implement detail view showing backend-calculated totals and all item periods/accounts.
- [ ] **Step 3:** Implement draft editing with all-item update payload, post, cancel, and delete actions.
- [ ] **Step 4:** Run tests and build.

### Task 6: Wire routes, sidebar, localization, and module exports

**Files:**
- Create: `src/modules/rental/routes.tsx`
- Create: `src/modules/rental/index.ts`
- Modify: `src/app/router/index.tsx`
- Modify: `src/app/config/menuPermissions.tsx`
- Modify: `src/config/locales/uz.json`
- Modify: `src/config/locales/ru.json`
- Modify: `src/config/locales/en.json`

- [ ] **Step 1:** Add settings-style route nesting and `PermissionCard` wrappers.
- [ ] **Step 2:** Add one sidebar dropdown with resource-specific view permissions.
- [ ] **Step 3:** Add all visible labels, field names, action labels, empty states, and error copy in all three locales.
- [ ] **Step 4:** Run the build and verify all route imports resolve.

### Task 7: Verify the integrated module

**Files:**
- Modify only files needed to correct verified failures.

- [ ] **Step 1:** Run `node --experimental-strip-types --test tests/rental.contracts.test.ts`.
- [ ] **Step 2:** Run `npm run build` and record the exit code and output.
- [ ] **Step 3:** Run `npm run lint` and distinguish new rental findings from pre-existing findings.
- [ ] **Step 4:** Inspect `git diff --stat` and `git status --short` to ensure only intended rental/docs/integration changes were added.
