import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRegulatedObligationSettingsQuery,
} from "../src/modules/settings/pages/regulatedObligationSettings/api/query.ts";
import { normalizeRegulatedObligationSettingsResponse } from "../src/modules/settings/pages/regulatedObligationSettings/api/normalize.ts";
import { getRegulatedObligationSettingId } from "../src/modules/settings/pages/regulatedObligationSettings/utils/settingId.ts";

test("regulated obligation settings query includes supported non-empty filters", () => {
  const params = buildRegulatedObligationSettingsQuery({
    categoryCode: "TAX",
    choosedDate: "2026-09-03",
    search: "VAT",
    isConfigured: true,
    page: 2,
    pageSize: 20,
  });

  assert.equal(
    params.toString(),
    "categoryCode=TAX&choosedDate=2026-09-03&search=VAT&isConfigured=true&page=2&pageSize=20",
  );
});

test("regulated obligation settings query omits empty optional filters", () => {
  const params = buildRegulatedObligationSettingsQuery({
    categoryCode: "",
    choosedDate: null,
    search: "",
    isConfigured: undefined,
  });

  assert.equal(params.toString(), "");
});

test("regulated obligation settings response exposes backend pagination metadata", () => {
  const normalized = normalizeRegulatedObligationSettingsResponse(
    {
      items: [],
      totalCount: 45,
      page: 2,
      pageSize: 20,
      totalPages: 3,
    },
    { page: 2, pageSize: 20 },
  );

  assert.deepEqual(normalized, {
    items: [],
    total: 45,
    page: 2,
    pageSize: 20,
    totalPages: 3,
  });
});

test("regulated obligation setting id only uses the settings id", () => {
  assert.equal(
    getRegulatedObligationSettingId({ settingId: 25, id: 7 }),
    25,
  );
  assert.equal(getRegulatedObligationSettingId({ settingId: null, id: 25 }), null);
  assert.equal(getRegulatedObligationSettingId({ settingId: null }), null);
});
