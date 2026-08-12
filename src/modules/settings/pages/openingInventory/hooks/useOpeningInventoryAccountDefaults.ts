import { useMemo } from "react";
import { useGetDetailDocumentAccountSettings } from "@/modules/settings/pages/documentAccountSettings/hooks";
import { getDefaultDocumentAccount } from "@/shared/documentAccounts";
import { openingInventoryDocumentTypeIds } from "../constants/endpoints";
import type { OpeningInventoryMode } from "../types/type";

export interface OpeningInventoryAccountDefaults {
  debitAccountId: number | null;
  debitAccountName: string;
}

const getDefaultAccount = (
  settings: ReturnType<
    typeof useGetDetailDocumentAccountSettings
  >["data"],
  roleCode: "purchase_debit",
) => {
  const account = getDefaultDocumentAccount(settings, roleCode);

  return {
    id: account.id,
    name: account.name,
  };
};

export const useOpeningInventoryAccountDefaults = (
  mode: OpeningInventoryMode,
  enabled = true,
) => {
  const settingsQuery = useGetDetailDocumentAccountSettings(
    openingInventoryDocumentTypeIds[mode],
    enabled,
  );

  return useMemo(() => {
    const debit = getDefaultAccount(settingsQuery.data, "purchase_debit");

    return {
      defaultAccounts: {
        debitAccountId: debit.id,
        debitAccountName: debit.name,
      } satisfies OpeningInventoryAccountDefaults,
      isLoading: settingsQuery.isLoading,
    };
  }, [settingsQuery.data, settingsQuery.isLoading]);
};
