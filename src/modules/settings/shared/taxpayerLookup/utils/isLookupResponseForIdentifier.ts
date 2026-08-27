import type { TaxpayerLookupDto } from "../types";

const digitsOnly = (value: unknown) =>
  typeof value === "string" ? value.replace(/\D/g, "") : "";

/** API javobi aynan qidirilgan INN yoki JSHSHIRga tegishliligini tekshiradi. */
export const isLookupResponseForIdentifier = (
  identifier: string,
  taxpayer: Pick<TaxpayerLookupDto, "CompanyInn" | "Pinfl">,
) => {
  const searched = digitsOnly(identifier);
  if (searched.length === 9) {
    return digitsOnly(taxpayer.CompanyInn) === searched;
  }
  if (searched.length === 14) {
    return digitsOnly(taxpayer.Pinfl) === searched;
  }
  return false;
};
