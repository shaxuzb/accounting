import { useMemo } from "react";
import { useGetDetailDocumentAccountSettings } from "@/modules/settings/pages/documentAccountSettings/hooks";
import { getDefaultDocumentAccount, useDocumentAccountOptions } from "@/shared/documentAccounts";
import type { SaleDocumentAccountOption } from "../types/type";
import {
  saleDocumentAccountRoleCodes,
  saleDocumentTypeId,
} from "../constants/documentAccount";

export const useGetSaleDocumentAccountOptions = (
  documentTypeId = saleDocumentTypeId,
) => {
  const customerQuery = useDocumentAccountOptions<SaleDocumentAccountOption>(
    documentTypeId,
    saleDocumentAccountRoleCodes.customerSettlement,
  );
  const incomeQuery = useDocumentAccountOptions<SaleDocumentAccountOption>(
    documentTypeId,
    saleDocumentAccountRoleCodes.income,
  );
  const vatQuery = useDocumentAccountOptions<SaleDocumentAccountOption>(
    documentTypeId,
    saleDocumentAccountRoleCodes.vat,
  );
  const costQuery = useDocumentAccountOptions<SaleDocumentAccountOption>(
    documentTypeId,
    saleDocumentAccountRoleCodes.cost,
  );
  const inventoryQuery = useDocumentAccountOptions<SaleDocumentAccountOption>(
    documentTypeId,
    saleDocumentAccountRoleCodes.inventory,
  );
  const settingsQuery = useGetDetailDocumentAccountSettings(
    documentTypeId,
    Boolean(documentTypeId),
  );

  return useMemo(() => {
    const configuredAccounts = (settingsQuery.data?.accountSettings ?? [])
      .flatMap((role) => role.accounts ?? [])
      .map((account) => ({
        id: Number(account.chartAccountId),
        number: account.chartAccountNumber,
        code: undefined,
        name: account.chartAccountName,
      }))
      .filter((account) => Number.isFinite(account.id) && account.id > 0);
    const chartAccounts = [
      ...(customerQuery.data ?? []),
      ...(incomeQuery.data ?? []),
      ...(vatQuery.data ?? []),
      ...(costQuery.data ?? []),
      ...(inventoryQuery.data ?? []),
      ...configuredAccounts,
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
      const account = getDefaultDocumentAccount(
        settingsQuery.data,
        documentRoleCode,
      );
      const option = account.id
        ? chartAccountById.get(Number(account.id))
        : undefined;

      return {
        id: account.id,
        name: account.name || option?.name || (option?.number ? String(option.number) : ""),
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
