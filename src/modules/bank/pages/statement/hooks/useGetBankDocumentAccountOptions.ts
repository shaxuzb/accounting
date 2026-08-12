import { useMemo } from "react";
import { useDocumentAccountOptions } from "@/shared/documentAccounts";
import type { BankChartAccountOption } from "../types/type";
import {
  bankDocumentAccountRoleCodes,
  bankDocumentTypeIds,
} from "../constants/endpoints";

export const useGetBankDocumentAccountOptions = () => {
  const incomeBankAccountQuery = useDocumentAccountOptions<BankChartAccountOption>(
    bankDocumentTypeIds.income,
    bankDocumentAccountRoleCodes.bankAccount,
  );
  const expenseBankAccountQuery = useDocumentAccountOptions<BankChartAccountOption>(
    bankDocumentTypeIds.expense,
    bankDocumentAccountRoleCodes.bankAccount,
  );
  const incomeOffsetAccountQuery = useDocumentAccountOptions<BankChartAccountOption>(
    bankDocumentTypeIds.income,
    bankDocumentAccountRoleCodes.offsetAccount,
  );
  const expenseOffsetAccountQuery = useDocumentAccountOptions<BankChartAccountOption>(
    bankDocumentTypeIds.expense,
    bankDocumentAccountRoleCodes.offsetAccount,
  );

  return useMemo(
    () => ({
      bankAccountOptionsByDocumentType: {
        [bankDocumentTypeIds.income]: incomeBankAccountQuery.data ?? [],
        [bankDocumentTypeIds.expense]: expenseBankAccountQuery.data ?? [],
      },
      offsetAccountOptionsByDocumentType: {
        [bankDocumentTypeIds.income]: incomeOffsetAccountQuery.data ?? [],
        [bankDocumentTypeIds.expense]: expenseOffsetAccountQuery.data ?? [],
      },
      isLoading:
        incomeBankAccountQuery.isLoading ||
        expenseBankAccountQuery.isLoading ||
        incomeOffsetAccountQuery.isLoading ||
        expenseOffsetAccountQuery.isLoading,
    }),
    [
      incomeBankAccountQuery.data,
      expenseBankAccountQuery.data,
      incomeOffsetAccountQuery.data,
      expenseOffsetAccountQuery.data,
      incomeBankAccountQuery.isLoading,
      expenseBankAccountQuery.isLoading,
      incomeOffsetAccountQuery.isLoading,
      expenseOffsetAccountQuery.isLoading,
    ],
  );
};
