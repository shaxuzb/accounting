# Rental API Contract Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the existing rental contracts and accrual UI to the current backend contract while preserving the existing visual language, routes, and user flow.

**Architecture:** Keep the existing `src/modules/rental` module, pages, routes, cards, tables, Formik forms, and reusable field components. Replace the single-lessor domain model with typed `lessors[]`, add free-rental and object utility data, normalize request dates at the payload boundary, and keep backend-owned accrual calculations read-only.

**Tech Stack:** React 19, TypeScript, Formik, Yup, TanStack Query, Ant Design, Axios, i18next, Node built-in test runner.

**Spec:** `C:/Users/ASUS/Downloads/Telegram Desktop/rental-api-uz.md` and the approved design in the conversation.

## Global Constraints

- Keep the current rental routes, Card/Collapse/Table layout, spacing, colors, and action-bar behavior unchanged.
- Send dates as `YYYY-MM-DD`; do not send `organizationId` in rental request bodies.
- Use `lessors[]`; never send legacy `lessorFullName`, `lessorInn`, or `lessorPinfl` request fields.
- Do not send or calculate `taxAmount`, `payableAmount`, or `amount` from the contract form.
- Use status IDs `1`, `2`, and `3`, not localized status text, for action visibility.
- Treat `isFreeOfCharge` as a conditional business mode: free objects use zero amounts and null accounts; paid objects require positive contract amounts and activate-time accounts.
- Preserve unrelated dirty-worktree changes and do not restore or delete files outside the rental migration scope.

---

### Task 1: Lock the new pure contract behavior with tests

**Files:**
- Create: `tests/rental.api-migration.test.ts`
- Modify: none

**Interfaces:**
- Tests import `buildContractPayload`, `mapRentalContractToForm`, `createRentalContractDefaults`, and the validation helper exposed by the rental schema module.

- [ ] **Step 1: Write failing tests** for: legacy lessor fields being absent from the payload; `lessors[]` preserving allowed fields while dropping response-only `id` and `counterpartyId`; dates being `YYYY-MM-DD`; free rental zeroing required values; and object IDs being retained only for updates.
- [ ] **Step 2: Run the focused test** with `node --experimental-strip-types --test tests/rental.api-migration.test.ts` and confirm it fails because the current model still uses legacy fields and date strings with `T00:00:00`.
- [ ] **Step 3: Add the smallest pure helpers** needed for payload date normalization and lessor payload filtering.
- [ ] **Step 4: Re-run the focused test** and confirm the new pure behavior passes before changing React components.

### Task 2: Migrate contract domain types, defaults, mapping, and validation

**Files:**
- Modify: `src/modules/rental/pages/contracts/types/type.ts`
- Modify: `src/modules/rental/pages/contracts/types/form.ts`
- Modify: `src/modules/rental/pages/contracts/types/schema.ts`
- Modify: `src/modules/rental/pages/contracts/utils/defaults.ts`
- Modify: `src/modules/rental/pages/contracts/utils/form.ts`
- Modify: `src/modules/rental/pages/contracts/utils/payload.ts`
- Create: `src/modules/rental/pages/contracts/utils/date.ts`
- Create: `src/modules/rental/pages/contracts/utils/lessor.ts`

**Interfaces:**
- `RentalLessorForm` contains `lessorKindCode`, `fullName`, `inn`, `pinfl`, `phoneNumber`, `registeredAddress`, and `residentialAddress`.
- `RentalContractForm` contains `isFreeOfCharge` and `lessors: RentalLessorForm[]`.
- `RentalContractObjectForm` contains `totalArea`, `rentedArea`, and `utilities: RentalUtilityForm[]`.
- `normalizeRentalDate(value: unknown): string` returns `YYYY-MM-DD` for date-only and ISO date-time values.
- `buildLessorPayload(lessor)` returns only backend request fields and excludes response-only identifiers.

- [ ] **Step 1: Extend the failing tests** with paid/free validation cases, date normalization cases, area ordering, object-date containment, and duplicate utility detection.
- [ ] **Step 2: Run the focused test** and confirm each new assertion fails for the old schema/defaults/mappers.
- [ ] **Step 3: Implement the types, defaults, response-to-form mapper, and payload mapper** so create and full PUT update bodies match the documented contract.
- [ ] **Step 4: Implement conditional Yup rules**: at least one lessor and identifier; legal entity INN; paid amounts/accounts; free amounts zero and expense account null; `taxBaseAmount >= contractAmount`; `taxRate` between 0 and 100; object dates inside contract dates; `rentedArea <= totalArea`; unique utilities per object.
- [ ] **Step 5: Run the focused test** and confirm all pure migration tests pass.

### Task 3: Add lessor, free-rental, area, and utility controls without redesigning the UI

**Files:**
- Modify: `src/modules/rental/pages/contracts/components/ContractFormFields.tsx`
- Modify: `src/modules/rental/pages/contracts/components/ContractObjectTable.tsx`
- Modify: `src/modules/rental/pages/contracts/screens/ContractAddEditPage.tsx`
- Modify: `src/modules/rental/pages/contracts/screens/ContractDetailPage.tsx`
- Modify: `src/modules/rental/pages/contracts/hooks/useRentalLessorLookup.ts`
- Modify: `src/modules/rental/pages/contracts/utils/mapTaxpayerToRentalLessor.ts`
- Modify: `src/config/locales/uz.json`
- Modify: `src/config/locales/ru.json`
- Modify: `src/config/locales/en.json`

**Interfaces:**
- Reuse the existing contract Card and object Collapse. Add repeatable lessor rows inside the contract information area and utility rows inside each object panel.
- Lessor lookup updates only the selected lessor index and does not overwrite other lessors.
- The free-rental toggle resets controlled monetary/account fields to documented values and makes them non-required in the UI.

- [ ] **Step 1: Add component-level test expectations** for rendering two lessors, adding/removing a lessor, switching lessor kind, showing free-rental controls, and adding a utility row.
- [ ] **Step 2: Run the focused UI tests** and confirm they fail because the current form has one lessor and no utility controls.
- [ ] **Step 3: Implement repeatable lessor rows** using existing `InputText`, `SearchInnField`, and select patterns; preserve current grid/card styling.
- [ ] **Step 4: Implement the free-rental control** and conditional disabling/clearing while keeping the current form submission/action bar intact.
- [ ] **Step 5: Add total/rented area and utility controls** inside the existing object Collapse panel, using `manuals/utility-services` for options and `LESSOR`/`LESSEE` static options.
- [ ] **Step 6: Update all three locale files** for lessor kind, contact/address, free rental, area, utility, and validation copy.
- [ ] **Step 7: Run the focused UI tests** and confirm they pass.

### Task 4: Update contract lists and read-only details

**Files:**
- Modify: `src/modules/rental/pages/contracts/screens/ContractListPage.tsx`
- Modify: `src/modules/rental/pages/contracts/components/readonly/ContractReadonlyView.tsx`
- Modify: `src/modules/rental/pages/accruals/components/ContractFilter.tsx`

**Interfaces:**
- List and detail views format any number of lessors into the existing table/grid presentation.
- Contract list displays free/paid state and keeps existing status/action behavior.
- Read-only object view displays area and utility data without making backend-calculated amounts editable.

- [ ] **Step 1: Add tests** for multi-lessor list labels and read-only rendering of free state, areas, and utilities.
- [ ] **Step 2: Run those tests** and confirm they fail against `lessorFullName` access.
- [ ] **Step 3: Replace legacy field reads** with a shared display formatter for `lessors[]` and add the new documented fields to existing columns/sections.
- [ ] **Step 4: Run the focused UI tests** and confirm they pass.

### Task 5: Migrate accrual types and views to the new lessor response

**Files:**
- Modify: `src/modules/rental/pages/accruals/types/type.ts`
- Modify: `src/modules/rental/pages/accruals/components/readonly/AccrualReadonlyView.tsx`
- Modify: `src/modules/rental/pages/accruals/screens/AccrualListPage.tsx`
- Modify: `src/modules/rental/pages/accruals/components/ContractFilter.tsx`
- Modify: `src/modules/rental/pages/accruals/components/AccrualItemsTable.tsx`
- Modify: `src/modules/rental/pages/accruals/screens/AccrualDetailPage.tsx`
- Modify: `src/modules/rental/pages/accruals/components/GenerateDueModal.tsx`

**Interfaces:**
- `RentalAccrualListItem` and `RentalAccrualDetail` contain `lessors: RentalLessor[]` and no legacy single-lessor fields.
- Accrual update continues to send only exchange rate, accounts, comment, and every item account.

- [ ] **Step 1: Add tests** for multi-lessor accrual list/detail display, positive exchange rate, and `generate-due` date serialization.
- [ ] **Step 2: Run the focused tests** and confirm they fail against the current single-lessor types and `T00:00:00` date.
- [ ] **Step 3: Update accrual types and display formatting** while leaving calculated amount rendering backend-driven.
- [ ] **Step 4: Add draft exchange-rate validation** requiring a value greater than zero and keep account/item checks delegated to backend plus visible form validation where possible.
- [ ] **Step 5: Serialize generate-due as `YYYY-MM-DD`** and run the focused tests again.

### Task 6: Verify integration and preserve the worktree

**Files:**
- Modify only files required by verified failures.

- [ ] **Step 1: Run** `node --experimental-strip-types --test tests/rental.api-migration.test.ts`.
- [ ] **Step 2: Run** `npm run build` and record the exit code.
- [ ] **Step 3: Run** `npm run lint` and distinguish rental findings from the existing unrelated warnings.
- [ ] **Step 4: Run** `git diff --check` and inspect `git diff --stat`.
- [ ] **Step 5: Run** `git status --short` and verify unrelated dirty files and deleted tests were not changed by this migration.
- [ ] **Step 6: Report any backend-dependent checks that cannot be completed without a configured API environment.**
