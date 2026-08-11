import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { useGetDetailDocumentAccountSettings } from "@/modules/settings/pages/documentAccountSettings/hooks";
import type { SaleDocumentAccountOption } from "../types/type";
import {
  saleDocumentAccountRoleCodes,
  saleDocumentTypeId,
} from "../constants/documentAccount";

const useGetRoleOptions = (
  documentTypeId: number,
  documentRoleCode: string,
) =>
  useQuery<SaleDocumentAccountOption[]>({
    queryKey: [
      "document-account-settings",
      "chart-accounts",
      documentTypeId,
      documentRoleCode,
    ],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SaleDocumentAccountOption[]>(
        `document-account-settings/${documentTypeId}/chart-accounts`,
        { params: { documentRoleCode } },
      );
      return data ?? [];
    },
    enabled: Boolean(documentTypeId),
  });

export const useGetSaleDocumentAccountOptions = (
  documentTypeId = saleDocumentTypeId,
) => {
  const customerQuery = useGetRoleOptions(
    documentTypeId,
    saleDocumentAccountRoleCodes.customerSettlement,
  );
  const incomeQuery = useGetRoleOptions(
    documentTypeId,
    saleDocumentAccountRoleCodes.income,
  );
  const vatQuery = useGetRoleOptions(
    documentTypeId,
    saleDocumentAccountRoleCodes.vat,
  );
  const costQuery = useGetRoleOptions(
    documentTypeId,
    saleDocumentAccountRoleCodes.cost,
  );
  const inventoryQuery = useGetRoleOptions(
    documentTypeId,
    saleDocumentAccountRoleCodes.inventory,
  );
  const settingsQuery = useGetDetailDocumentAccountSettings(
    documentTypeId,
    Boolean(documentTypeId),
  );

  return useMemo(() => {
    const chartAccounts = [
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
    );
    const chartAccountById = new Map(
      chartAccounts.map((account) => [Number(account.id), account]),
    );

    const getDefaultAccount = (documentRoleCode: string) => {
      const role = settingsQuery.data?.accountSettings?.find(
        (item) => item.documentAccountRoleCode === documentRoleCode,
      );
      const account = role?.accounts?.find((item) => item.isDefault);
      const option = account
        ? chartAccountById.get(Number(account.chartAccountId))
        : undefined;

      return {
        id: account?.chartAccountId ?? null,
        name:
          account?.chartAccountName ??
          option?.name ??
          (option?.number ? String(option.number) : ""),
      };
    };

    const inventory = getDefaultAccount(saleDocumentAccountRoleCodes.inventory);
    const income = getDefaultAccount(saleDocumentAccountRoleCodes.income);
    const cost = getDefaultAccount(saleDocumentAccountRoleCodes.cost);

    return {
      chartAccounts,
      defaultAccounts: {
        inventoryAccountId: inventory.id,
        inventoryAccountName: inventory.name,
        incomeAccountId: income.id,
        incomeAccountName: income.name,
        costAccountId: cost.id,
        costAccountName: cost.name,
      },
      isLoading:
        customerQuery.isLoading ||
        incomeQuery.isLoading ||
        vatQuery.isLoading ||
        costQuery.isLoading ||
        inventoryQuery.isLoading ||
        settingsQuery.isLoading,
    };
  }, [
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
    settingsQuery.data,
    settingsQuery.isLoading,
  ]);
};
