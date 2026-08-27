import assert from "node:assert/strict";
import test from "node:test";
import {
  findDictionaryIdByCode,
  isLegalEntity,
  mapTaxpayerToOrganization,
} from "../src/modules/settings/pages/organizations/utils/mapTaxpayerToOrganization.ts";
import { mapTaxpayerToEmployee } from "../src/modules/settings/pages/payrollEmployees/utils/mapTaxpayerToEmployee.ts";
import { parsePinflBirthDate } from "../src/modules/settings/shared/taxpayerLookup/utils/parsePinflBirthDate.ts";
import { isLookupResponseForIdentifier } from "../src/modules/settings/shared/taxpayerLookup/utils/isLookupResponseForIdentifier.ts";
import { mergeLookupValues } from "../src/modules/settings/shared/taxpayerLookup/utils/mergeLookupValues.ts";
import { mapTaxpayerToCounterparty } from "../src/modules/settings/pages/counterparty/utils/mapTaxpayerToCounterparty.ts";

test("treats a lookup response without Pinfl as a legal entity", () => {
  assert.equal(isLegalEntity({ Pinfl: null }), true);
});

test("does not treat a lookup response with Pinfl as a legal entity", () => {
  assert.equal(isLegalEntity({ Pinfl: "32002782350031" }), false);
});

test("resolves a region code without treating the internal id as the code", () => {
  const id = findDictionaryIdByCode(
    [
      { id: 101, code: "011" },
      { id: 102, code: "012" },
    ],
    "12",
  );

  assert.equal(id, 102);
});

test("does not map an individual lookup response into organization fields", () => {
  const values = mapTaxpayerToOrganization({
    CompanyInn: "462111049",
    Pinfl: "32002782350031",
    CompanyName: "TO‘XTAMISHOV BEKMUROD DONIYEVICH",
    CompanyAddress: null,
    RegionCode: null,
    Region: null,
    DistrictCode: null,
    District: null,
    PhoneNumber: null,
    Email: null,
    VatCode: null,
    SpecialAccount: null,
    Accounts: [],
    DirectorInn: null,
    DirectorPinfl: null,
    DirectorName: null,
    Accountant: null,
    Oked: null,
    TaxGap: null,
    TaxPayerTypeName: null,
    Branches: [],
  });

  assert.deepEqual(values, {});
});

test("maps a person lookup response only to employee fields", () => {
  const values = mapTaxpayerToEmployee({
    CompanyInn: "462111049",
    Pinfl: "32002782350031",
    CompanyName: "TO‘XTAMISHOV BEKMUROD DONIYEVICH",
    CompanyAddress: null,
    RegionCode: null,
    Region: null,
    DistrictCode: null,
    District: null,
    PhoneNumber: null,
    Email: null,
    VatCode: "VAT-1",
    SpecialAccount: "ACCOUNT-1",
    Accounts: [],
    DirectorInn: null,
    DirectorPinfl: null,
    DirectorName: null,
    Accountant: null,
    Oked: "64190",
    TaxGap: null,
    TaxPayerTypeName: "Individual",
    Branches: [],
  });

  assert.deepEqual(values, {
    pinfl: "32002782350031",
    tin: "462111049",
    lastName: "TO‘XTAMISHOV",
    firstName: "BEKMUROD",
    middleName: "DONIYEVICH",
    birthDate: "1978-02-20",
  });
});

test("extracts a birth date from the PINFL date segment", () => {
  assert.equal(parsePinflBirthDate("32002782350031"), "1978-02-20");
  assert.equal(parsePinflBirthDate("51311030000000"), "2003-11-13");
});

test("does not produce a date for an incomplete or invalid PINFL", () => {
  assert.equal(parsePinflBirthDate("5131103"), null);
  assert.equal(parsePinflBirthDate("32000002350031"), null);
});

test("accepts only a lookup response that matches the searched identifier", () => {
  const taxpayer = {
    CompanyInn: "462111049",
    Pinfl: "32002782350031",
  };

  assert.equal(isLookupResponseForIdentifier("462111049", taxpayer), true);
  assert.equal(isLookupResponseForIdentifier("32002782350031", taxpayer), true);
  assert.equal(isLookupResponseForIdentifier("200833707", taxpayer), false);
  assert.equal(isLookupResponseForIdentifier("32002782350030", taxpayer), false);
});

test("clears unchanged values from the previous lookup before applying the new result", () => {
  assert.deepEqual(
    mergeLookupValues(
      { fullName: "New search", phone: "+998901111111", manual: "keep" },
      { fullName: "Old person", phone: "+998901111111" },
      { fullName: "New person" },
      { fullName: "", phone: null },
    ),
    { fullName: "New person", phone: null, manual: "keep" },
  );
});

test("maps a taxpayer lookup into counterparty fields", () => {
  const values = mapTaxpayerToCounterparty(
    {
      CompanyInn: "462111049",
      Pinfl: "32002782350031",
      CompanyName: "TO‘XTAMISHOV BEKMUROD DONIYEVICH",
      CompanyAddress: "Навбахорский район",
      RegionCode: "12",
      Region: "НАВОИЙСКАЯ ОБЛАСТЬ",
      DistrictCode: "8",
      District: "НАВБАХОРСКИЙ РАЙОН",
      PhoneNumber: null,
      Email: null,
      VatCode: null,
      SpecialAccount: null,
      Accounts: [],
      DirectorInn: null,
      DirectorPinfl: null,
      DirectorName: null,
      Accountant: null,
      Oked: null,
      TaxGap: null,
      TaxPayerTypeName: null,
      Branches: [],
    },
    { regionId: 12, districtId: 8 },
  );

  assert.deepEqual(values, {
    inn: "462111049",
    fullName: "TO‘XTAMISHOV BEKMUROD DONIYEVICH",
    shortName: "TO‘XTAMISHOV BEKMUROD DONIYEVICH",
    address: "Навбахорский район",
    regionId: 12,
    districtId: 8,
  });
});
