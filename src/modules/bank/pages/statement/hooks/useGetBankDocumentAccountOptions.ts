import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import type { BankChartAccountOption } from "../types/type";
import {
  bankDocumentAccountChartAccountsPath,
  bankDocumentAccountRoleCodes,
  bankDocumentTypeIds,
} from "../constants/endpoints";

type BankDocumentTypeId =
  (typeof bankDocumentTypeIds)[keyof typeof bankDocumentTypeIds];
type BankDocumentAccountRoleCode =
  (typeof bankDocumentAccountRoleCodes)[keyof typeof bankDocumentAccountRoleCodes];

const useGetRoleOptions = (
  documentTypeId: BankDocumentTypeId,
  documentRoleCode: BankDocumentAccountRoleCode,
) =>
  useQuery<BankChartAccountOption[]>({
    queryKey: [
      "document-account-settings",
      "chart-accounts",
      documentTypeId,
      documentRoleCode,
    ],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<BankChartAccountOption[]>(
        bankDocumentAccountChartAccountsPath(documentTypeId),
        { params: { documentRoleCode } },
      );
      return data ?? [];
    },
  });

export const useGetBankDocumentAccountOptions = () => {
  const incomeBankAccountQuery = useGetRoleOptions(
    bankDocumentTypeIds.income,
    bankDocumentAccountRoleCodes.bankAccount,
  );
  const expenseBankAccountQuery = useGetRoleOptions(
    bankDocumentTypeIds.expense,
    bankDocumentAccountRoleCodes.bankAccount,
  );
  const incomeOffsetAccountQuery = useGetRoleOptions(
    bankDocumentTypeIds.income,
    bankDocumentAccountRoleCodes.offsetAccount,
  );
  const expenseOffsetAccountQuery = useGetRoleOptions(
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
