import { useMemo } from "react";
import { useGetDetailDocumentAccountSettings } from "@/modules/settings/pages/documentAccountSettings/hooks";
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
  const role = settings?.accountSettings?.find(
    (item) => item.documentAccountRoleCode === roleCode,
  );
  const account = role?.accounts?.find((item) => item.isDefault);

  return {
    id: account?.chartAccountId ?? null,
    name:
      account?.chartAccountName ??
      (account?.chartAccountNumber ? String(account.chartAccountNumber) : ""),
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
