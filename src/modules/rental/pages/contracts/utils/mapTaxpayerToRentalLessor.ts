import type { TaxpayerLookupDto } from "@/modules/settings/shared/taxpayerLookup";
import type { RentalContractForm } from "../types/form";

const meaningful = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const mapTaxpayerToRentalLessor = (
  taxpayer: TaxpayerLookupDto,
): Partial<
  Pick<RentalContractForm, "lessorFullName" | "lessorInn" | "lessorPinfl">
> => ({
  lessorFullName: meaningful(taxpayer.CompanyName)
    ? taxpayer.CompanyName.trim()
    : "",
  lessorInn: meaningful(taxpayer.CompanyInn)
    ? taxpayer.CompanyInn.trim()
    : null,
  lessorPinfl: meaningful(taxpayer.Pinfl) ? taxpayer.Pinfl.trim() : null,
});
