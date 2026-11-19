import { $axiosPrivate } from "@/services/AxiosService";
import type { TaxpayerLookupDto } from "./types";

/**
 * A bank account from the tax data read against our bank directory: the bank and branch by its MFO,
 * the currency by the account number. Unresolved accounts cannot be saved as they are.
 */
export interface ResolvedBankAccount {
  accountNumber: string;
  mfo: string | null;
  bankId: number | null;
  bankName: string | null;
  bankBranchId: number | null;
  bankBranchName: string | null;
  currencyId: number | null;
  currencyCode: string | null;
  isMain: boolean;
  isResolved: boolean;
}

/** The taxpayer's bank accounts (Faktura gives them by INN) with their bank, branch and currency. */
export const resolveTaxpayerAccounts = async (
  taxpayer: TaxpayerLookupDto,
): Promise<ResolvedBankAccount[]> => {
  const accounts = (taxpayer.Accounts ?? [])
    .filter((account) => account.AccountCode?.trim())
    .map((account) => ({
      accountNumber: account.AccountCode!.trim(),
      mfo: account.BankMfo,
      bankName: account.BankName,
      isMain: account.IsPrimary,
    }));
  if (accounts.length === 0) return [];
  const { data } = await $axiosPrivate.post<ResolvedBankAccount[]>(
    "/banks/resolve-accounts",
    { accounts },
  );
  return data;
};
