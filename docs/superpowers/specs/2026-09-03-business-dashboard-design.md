# Business Dashboard Design

## Goal

Build a responsive accounting dashboard that consumes the documented read-only dashboard APIs and presents trustworthy financial information without inventing unavailable values.

## Product direction

The competitor reference establishes the information density and section rhythm, but the implementation keeps the existing Artel Accounting visual language: blue brand actions, neutral cards, green inflow/positive values, red outflow/risks, and compact tables. The dashboard is a dedicated `/main/dashboard` page reached from the sidebar; it is not the post-login landing route.

## Layout

```text
Page header: title + organization + date range + refresh
Global filter bar: date range + currency selection
Cash summary: full-width totals + account/cash-box table
Financial health: receivables/payables + tax summary
Electronic documents: count cards + status/type/direction visualization
Unavailable/source notes: task calendar and partial-source explanations
```

Each section has its own loading skeleton, empty state, `PARTIAL` warning, `NOT_AVAILABLE` state, retry action where useful, and correlation-safe error copy. A failure in one widget does not blank other widgets.

## API/data architecture

- Use the existing `$axiosPrivate` client so bearer token, `X-OrganizationId`, and `X-Language` headers are applied by the existing interceptor.
- Add typed dashboard models, query builders, and a service under `src/modules/dashboard`.
- Use React Query for request caching and independent widget invalidation. The overview response supplies the first dashboard paint. Widget-specific endpoints are available for isolated retry/refresh and future detail interactions.
- Query arrays use repeated keys (`currencyIds=1&currencyIds=2`). No token enters query keys or logs.
- Global filters are date range and currencies. Electronic-document type/status filters stay local to that widget; tax document type stays local to tax. Endpoint builders never receive unrelated filter fields.

## Contract limitations represented in UI

- Tasks are shown as “Vazifalar mavjud emas” because the endpoint returns `NOT_AVAILABLE`.
- Nullable receivable/payable overdue is displayed as unavailable, never as zero.
- Empty electronic-document amount series renders a count-focused empty chart state.
- `statusIds` is labeled as a filter but the UI does not claim server-side filtering is fully supported; `PARTIAL` remains visible when supplied.
- Cash account names remain masked/display-safe and `sourceType` is translated to bank account or cash box.

## Accessibility/responsive behavior

Use semantic headings, labelled filter controls, visible keyboard focus, status text in addition to color, and respect reduced motion. At desktop widths cash is full width and the financial-health cards share a row; below tablet width cards stack and tables scroll horizontally.

## Verification

Add unit tests for repeated query serialization, endpoint-specific filter isolation, and status/nullable display helpers. Verify with the project build, lint, and the dashboard test suite. Live API acceptance remains dependent on an authenticated backend session.
