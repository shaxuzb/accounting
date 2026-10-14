import type { TaxpayerLookupDto } from "@/modules/settings/shared/taxpayerLookup";
// @ts-expect-error Native Node test runner loads TypeScript source modules directly.
import { normalizeLookupPhone } from "../../../shared/taxpayerLookup/utils/normalizeLookupPhone.ts";
import type { CounterpartyForm } from "../types/form";

const meaningful = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const mapTaxpayerToCounterparty = (
  taxpayer: TaxpayerLookupDto,
  location?: { regionId: number | null; districtId: number | null },
): Partial<CounterpartyForm> => {
  const mapped: Partial<CounterpartyForm> = {};

  if (meaningful(taxpayer.CompanyInn)) {
    mapped.inn = taxpayer.CompanyInn.trim();
    mapped.kindId = 1;
  } else if (meaningful(taxpayer.Pinfl)) {
    // a person found by PINFL: the PINFL has its own field, the card is a person's
    mapped.inn = "";
    mapped.pinfl = taxpayer.Pinfl.trim();
    mapped.kindId = 2;
  }
  mapped.isVatPayer = meaningful(taxpayer.VatCode);
  if (meaningful(taxpayer.CompanyName)) {
    const name = taxpayer.CompanyName.trim();
    mapped.fullName = name;
    mapped.shortName = name;
  }
  if (meaningful(taxpayer.CompanyAddress)) {
    mapped.address = taxpayer.CompanyAddress.trim();
  }
  if (meaningful(taxpayer.PhoneNumber)) {
    mapped.phoneNumber = normalizeLookupPhone(taxpayer.PhoneNumber);
  }
  if (meaningful(taxpayer.Email)) {
    mapped.email = taxpayer.Email.trim();
  }
  if (location?.regionId !== null && location?.regionId !== undefined) {
    mapped.regionId = location.regionId;
  }
  if (location?.districtId !== null && location?.districtId !== undefined) {
    mapped.districtId = location.districtId;
  }

  return mapped;
};
