import type { TaxpayerLookupDto } from "@/modules/settings/shared/taxpayerLookup";
import type { RentalLessorForm } from "../types/form";

const meaningful = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const mapTaxpayerToRentalLessor = (
  taxpayer: TaxpayerLookupDto,
): Partial<RentalLessorForm> => ({
  lessorKindCode: meaningful(taxpayer.Pinfl) ? "INDIVIDUAL" : "LEGAL_ENTITY",
  fullName: meaningful(taxpayer.CompanyName) ? taxpayer.CompanyName.trim() : "",
  inn: meaningful(taxpayer.CompanyInn) ? taxpayer.CompanyInn.trim() : null,
  pinfl: meaningful(taxpayer.Pinfl) ? taxpayer.Pinfl.trim() : null,
});
