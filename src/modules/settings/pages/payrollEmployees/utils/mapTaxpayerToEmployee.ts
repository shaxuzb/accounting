import type { TaxpayerLookupDto } from "@/modules/settings/shared/taxpayerLookup";
import type { PayrollEmployeeMainForm } from "../types/form";
// @ts-expect-error Native Node test runner loads TypeScript source modules directly.
import { parsePinflBirthDate } from "../../../shared/taxpayerLookup/utils/parsePinflBirthDate.ts";

const meaningful = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? `+${digits}` : null;
};

const mapPersonName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return {};

  return {
    lastName: parts[0],
    firstName: parts[1],
    ...(parts.length > 2
      ? { middleName: parts.slice(2).join(" ") }
      : {}),
  };
};

export const mapTaxpayerToEmployee = (
  taxpayer: TaxpayerLookupDto,
): Partial<PayrollEmployeeMainForm> => {
  if (taxpayer.Pinfl === null) return {};

  const mapped: Partial<PayrollEmployeeMainForm> = {
    pinfl: taxpayer.Pinfl.trim(),
  };

  const birthDate = parsePinflBirthDate(taxpayer.Pinfl);
  if (birthDate) mapped.birthDate = birthDate;

  if (meaningful(taxpayer.CompanyInn)) mapped.tin = taxpayer.CompanyInn.trim();
  if (meaningful(taxpayer.CompanyName)) {
    Object.assign(mapped, mapPersonName(taxpayer.CompanyName));
  }
  if (meaningful(taxpayer.PhoneNumber)) {
    mapped.phoneNumber = normalizePhone(taxpayer.PhoneNumber);
  }
  if (meaningful(taxpayer.Email)) mapped.email = taxpayer.Email.trim();

  return mapped;
};
