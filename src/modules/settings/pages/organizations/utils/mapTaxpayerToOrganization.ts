import type {
  organizationCreate,
} from "../types/type";
import type { TaxpayerLookupDto } from "@/modules/settings/shared/taxpayerLookup";
// @ts-expect-error Native Node test runner loads TypeScript source modules directly.
import { findDictionaryIdByCode } from "../../../shared/taxpayerLookup/utils/findDictionaryIdByCode.ts";
// @ts-expect-error Native Node test runner loads TypeScript source modules directly.
import { normalizeLookupPhone } from "../../../shared/taxpayerLookup/utils/normalizeLookupPhone.ts";

const meaningful = (value: unknown): value is string | number =>
  (typeof value === "string" && value.trim().length > 0) ||
  (typeof value === "number" && Number.isFinite(value));

export { findDictionaryIdByCode };

export const isLegalEntity = (
  taxpayer: Pick<TaxpayerLookupDto, "Pinfl">,
) => taxpayer.Pinfl === null;

export const mapTaxpayerToOrganization = (
  taxpayer: TaxpayerLookupDto,
  location?: { regionId: number | null; districtId: number | null },
): Partial<organizationCreate> => {
  const mapped: Partial<organizationCreate> = {};

  if (!isLegalEntity(taxpayer)) return mapped;

  if (meaningful(taxpayer.CompanyInn)) mapped.inn = taxpayer.CompanyInn.trim();
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
  if (meaningful(taxpayer.DirectorName)) {
    mapped.director = taxpayer.DirectorName.trim();
  }
  if (location?.regionId !== null && location?.regionId !== undefined) {
    mapped.regionId = location.regionId;
  }
  if (location?.districtId !== null && location?.districtId !== undefined) {
    mapped.districtId = location.districtId;
  }

  return mapped;
};
