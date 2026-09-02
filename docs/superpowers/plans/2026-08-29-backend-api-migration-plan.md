# Backend API Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the frontend to the 2026-08-28 backend contracts while preserving the existing module/page architecture.

**Architecture:** Keep feature code inside the owning module. Settings owns payment acceptance point CRUD; cashoperation owns cash collection, payment acceptance point operations, and fiscal transfers; bank and retail-sale keep their existing screens and replace only their API models, payloads, selectors, and lifecycle actions. Shared constants remain limited to select-list paths and display helpers.

**Tech Stack:** React, TypeScript, React Router, Formik/Yup, TanStack Query, Axios, Ant Design, Node built-in test runner with TypeScript strip-types.

**Spec:** `C:\Users\ASUS\Downloads\Telegram Desktop\frontend-api-changes-2026-08-28-uz.md` and `C:\Users\ASUS\Downloads\Telegram Desktop\cash-fiscal-transfer-api-for-frontend-uz.md`

## Global Constraints

- Do not send backend-owned fields such as `docNumber`, status timestamps, registry IDs, or payment acceptance point `code` in create/update requests.
- Use `relatedDocumentId` as the common document registry row ID, never the source entity ID.
- Use `paymentAcceptancePointId` in retail requests/responses; `CASH` payments must use `null`, non-cash payments must use a point.
- Counterparties are neutral: remove `counterpartyTypeId`, `counterpartyTypeName`, `isCustomer`, and `isSupplier` from models, forms, and requests.
- Keep existing auth headers and paginated response handling.

### Task 1: Stabilize the existing payment acceptance point CRUD

**Files:** `src/modules/settings/pages/paymentAcceptancePoint/types/form.ts`, CRUD screens/hooks, contract tests.

- [ ] Make update payload `stateId` required and ensure create strips backend-owned fields defensively.
- [ ] Surface list/detail query errors in the existing screen pattern.
- [ ] Keep endpoint and request contract tests green.

### Task 2: Migrate counterparties and manuals

**Files:** `src/modules/settings/pages/counterparty/**`, bank missing-counterparty flow, `src/shared/constants/selectLists.ts`.

- [ ] Remove role/type fields from counterparty form, model, schema, and edit mapping.
- [ ] Remove the counterparty-type selector and old manuals constants.
- [ ] Replace supplier/client/type manual references with the neutral counterparties manual.
- [ ] Remove `counterpartyTypeId` from bank bulk-counterparty creation.

### Task 3: Migrate retail payments and bank document linking

**Files:** `src/modules/sale/pages/retail-sale/**`, `src/modules/bank/pages/statement/**`.

- [ ] Rename retail payment fields and selector paths to payment acceptance points.
- [ ] Add CASH/non-CASH Yup validation and payload normalization.
- [ ] Add `relatedDocumentId` to bank create/update/list/detail types and form controls using the common documents registry.

### Task 4: Add read-only document registry and cash workflows

**Files:** new feature folders under `src/modules/cashoperation/pages/` plus a small documents service folder.

- [ ] Add `/documents` read-only service/hooks and types.
- [ ] Add cash collection list/detail/create/edit lifecycle for `/cash-collection-docs` and `in-transit` lookup.
- [ ] Add payment acceptance point operations list/detail/create/edit/confirm/cancel/delete and balance lookup.
- [ ] Add fiscal transfer list/detail/create/edit/confirm/cancel/delete with fiscal-register/main-cash selection rules.

### Task 5: Route, menu, legacy cleanup, and verification

**Files:** cash/settings routes and menus, locales, tests, `package.json`.

- [ ] Add the new cash pages to the Kassa sidebar using existing permission wrappers.
- [ ] Remove active old bank-terminal and role-based manual calls/routes.
- [ ] Add contract tests for all endpoint paths and payload rules.
- [ ] Run tests, lint, build, and `git diff --check`.
