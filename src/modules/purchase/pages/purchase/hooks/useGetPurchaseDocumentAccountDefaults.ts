import { useMemo } from "react";
import { useGetDetailDocumentAccountSettings } from "@/modules/settings/pages/documentAccountSettings/hooks";
import { getDefaultDocumentAccount } from "@/shared/documentAccounts";
import type { PurchaseMode } from "../types/type";
import {
  purchaseDocumentTypeIds,
} from "../constants/endpoints";

export interface PurchaseDocumentAccountDefaults {
  debitAccountId: number | null;
  debitAccountName: string;
  vatAccountId: number | null;
  vatAccountName: string;
}

const getDefaultAccount = (
  settings: ReturnType<
    typeof useGetDetailDocumentAccountSettings
  >["data"],
  roleCode: "purchase_debit" | "purchase_vat",
) => {
  const account = getDefaultDocumentAccount(settings, roleCode);

  return {
    id: account.id,
    name: account.name,
  };
};

export const useGetPurchaseDocumentAccountDefaults = (
  purchaseMode: PurchaseMode,
  enabled = true,
) => {
  const settingsQuery = useGetDetailDocumentAccountSettings(
    purchaseDocumentTypeIds[purchaseMode],
    enabled,
  );

  return useMemo(() => {
    const debit = getDefaultAccount(
      settingsQuery.data,
      "purchase_debit",
    );
    const vat = getDefaultAccount(settingsQuery.data, "purchase_vat");

    return {
      defaultAccounts: {
        debitAccountId: debit.id,
        debitAccountName: debit.name,
        vatAccountId: vat.id,
        vatAccountName: vat.name,
      } satisfies PurchaseDocumentAccountDefaults,
      isLoading: settingsQuery.isLoading,
    };
  }, [settingsQuery.data, settingsQuery.isLoading]);
};
