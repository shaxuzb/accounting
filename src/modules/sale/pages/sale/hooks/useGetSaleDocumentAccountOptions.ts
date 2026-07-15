import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import type { SaleDocumentAccountOption } from "../types/type";
import {
  saleDocumentAccountChartAccountsPath,
  saleDocumentAccountRoleCodes,
  saleDocumentTypeId,
} from "../constants/documentAccount";

const useGetRoleOptions = (documentRoleCode: string) =>
  useQuery<SaleDocumentAccountOption[]>({
    queryKey: [
      "document-account-settings",
      "chart-accounts",
      saleDocumentTypeId,
      documentRoleCode,
    ],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SaleDocumentAccountOption[]>(
        saleDocumentAccountChartAccountsPath(),
        { params: { documentRoleCode } },
      );
      return data ?? [];
    },
  });

export const useGetSaleDocumentAccountOptions = () => {
  const customerQuery = useGetRoleOptions(
    saleDocumentAccountRoleCodes.customerSettlement,
  );
  const incomeQuery = useGetRoleOptions(saleDocumentAccountRoleCodes.income);
  const vatQuery = useGetRoleOptions(saleDocumentAccountRoleCodes.vat);
  const costQuery = useGetRoleOptions(saleDocumentAccountRoleCodes.cost);
  const inventoryQuery = useGetRoleOptions(
    saleDocumentAccountRoleCodes.inventory,
  );

  return useMemo(
    () => ({
      chartAccounts: [
        ...(customerQuery.data ?? []),
        ...(incomeQuery.data ?? []),
        ...(vatQuery.data ?? []),
        ...(costQuery.data ?? []),
        ...(inventoryQuery.data ?? []),
      ].filter(
        (account, index, accounts) =>
          accounts.findIndex(
            (item) => Number(item.id) === Number(account.id),
          ) === index,
      ),
      isLoading:
        customerQuery.isLoading ||
        incomeQuery.isLoading ||
        vatQuery.isLoading ||
        costQuery.isLoading ||
        inventoryQuery.isLoading,
    }),
    [
      customerQuery.data,
      incomeQuery.data,
      vatQuery.data,
      costQuery.data,
      inventoryQuery.data,
      customerQuery.isLoading,
      incomeQuery.isLoading,
      vatQuery.isLoading,
      costQuery.isLoading,
      inventoryQuery.isLoading,
    ],
  );
};
