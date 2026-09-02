# Rental Module Design

## Goal

Add a rental module that exposes rental contracts and rental accrual documents through the existing accounting application UI, routing, workspace tabs, organization context, permissions, and reusable components.

## User request and source contract

The user requested that both API areas live in one module, follow the same architecture as `src/modules/settings`, and match the system UI. The attached `rental-api-for-frontend.md` is treated as API documentation, not as additional user instructions.

## Architecture

`src/modules/rental` is the module boundary. It exports `rentalRoutes` from `index.ts`, and `src/app/router/index.tsx` mounts those routes below `main`. The module contains two self-contained page areas: `pages/contracts` and `pages/accruals`.

Each page area owns its own `constants/permissions.ts`, `constants/queryKeys.ts`, `constants/endpoints.ts`, `api.ts`, `hooks/`, `types/`, `components/`, and `screens/`. Only genuinely shared rental behavior belongs in `src/modules/rental/shared`.

The sidebar has one `Ijara` dropdown with `Ijara shartnomalari` and `Ijara hisob-kitoblari` children. Each child uses its own view permission. Routes use the existing `PermissionCard` wrapper and workspace route handles.

## Routes

```text
/main/rentals/contracts
/main/rentals/contracts/add
/main/rentals/contracts/edit/:id
/main/rentals/contracts/:id
/main/rentals/accruals
/main/rentals/accruals/:id
```

Contract creation is a frontend form and always starts as `DRAFT`. Accrual creation is not a normal form: the list has a generate-due action that calls the backend generator and refreshes the list.

## API behavior

The Axios interceptor already provides `Authorization`, `X-OrganizationId`, `X-Language`, and JSON content type behavior. Rental request bodies must not include `organizationId`.

Contract endpoints:

- `GET /rental-contracts`
- `POST /rental-contracts`
- `GET /rental-contracts/{id}`
- `PUT /rental-contracts/{id}`
- `DELETE /rental-contracts/{id}`
- `PUT /rental-contracts/{id}/activate`
- `PUT /rental-contracts/{id}/cancel`

Accrual endpoints:

- `GET /rental-accrual-docs`
- `GET /rental-accrual-docs/{id}`
- `PUT /rental-accrual-docs/{id}`
- `DELETE /rental-accrual-docs/{id}`
- `POST /rental-accrual-docs/generate-due`
- `PUT /rental-accrual-docs/{id}/post`
- `PUT /rental-accrual-docs/{id}/cancel`

List adapters normalize the documented `{ items, totalCount, page, pageSize, ... }` response into the repository `Paginated<T>` shape without losing page metadata. Detail and mutation methods preserve `204 No Content` behavior.

## Domain rules

Status IDs are constants: `1 = DRAFT`, `2 = POSTED`, `3 = CANCELLED`. Action visibility is driven by `statusId`, never by localized `statusName`.

Contract forms support lessor identity, contract dates, currency, payable/tax accounts, comment, and a dynamic objects table. Each object supports type, name, identifier, address, dates, period unit/value, amount, tax base/rate, and expense account. Existing object IDs are preserved on update; new objects use `null` or no ID.

Accrual detail is read-only for calculated amounts. Draft accrual editing can change exchange rate, payable/tax accounts, each existing item's expense account, and comment. The update payload must include every detail item exactly once and must never send calculated amounts.

Account options use the documented active chart-account endpoint and the `rental_accrual` document-account setting recommendations where available. The UI remains usable if recommendation data is absent; the user can still choose from active chart accounts.

## UI and error handling

Screens use existing `Card`, `Table`, `SearchFilter`, date/filter controls, `ListPagination`, `PermissionCard`, `ProcessStatusBadge`, `ActionColumns`, `SelectCustom`, `SelectDate`, input fields, `Descriptions`, `Popconfirm`, `Alert`, and `App` message/toast patterns. Complex forms and details are full workspace pages, not new visual primitives.

After every successful `204` mutation, invalidate the relevant list/detail queries and reload detail data where the user remains on a detail page. Standard API errors are routed through the existing `errorHandlers`; documented rental error titles are shown as backend-provided messages.

## Testing and verification

Pure request helpers will be covered with Node's built-in test runner: endpoint URL mapping, query serialization, paginated response normalization, and draft update payload rules. Verification includes the focused rental test, `npm run build`, and `npm run lint` with any pre-existing unrelated worktree failures reported separately.
