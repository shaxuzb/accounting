import type { ComponentProps } from "react";
import SelectCustom from "./SelectCustom";
import { useGetDetailDocumentAccountSettings } from "@/modules/settings/pages/documentAccountSettings/hooks";
import {
  chartAccountNumberSelectedLabel,
  chartAccountSelectDisplayConfig,
} from "@/shared/constants/selectLists";
import { documentAccountChartAccountsPath } from "@/shared/documentAccounts";

type SelectCustomProps = ComponentProps<typeof SelectCustom>;

type DocumentAccountSelectProps = Omit<
  SelectCustomProps,
  | "path"
  | "queryParams"
  | "displayConfig"
  | "optionLabel"
  | "selectedLabel"
> & {
  documentTypeId: string | number;
  documentRoleCode: string;
  /** Payroll can expose recommended accounts without forcing the first option. */
  allowUserSelection?: boolean;
  /** Use the full chart of accounts when the role has no configured options. */
  fallbackToAllAccounts?: boolean;
};

export default function DocumentAccountSelect({
  documentTypeId,
  documentRoleCode,
  allowUserSelection = false,
  fallbackToAllAccounts = false,
  ...props
}: DocumentAccountSelectProps) {
  const settingsQuery = useGetDetailDocumentAccountSettings(
    documentTypeId,
    props.enabled !== false,
  );
  const configuredRole = settingsQuery.data?.accountSettings?.find(
    (role) =>
      role.documentAccountRoleCode.trim().toLowerCase() ===
      documentRoleCode.trim().toLowerCase(),
  );
  const defaultAccount = configuredRole?.accounts?.find(
    (account) => account.isDefault,
  );
  const selectedDefaultAccount =
    defaultAccount ?? configuredRole?.accounts?.[0];
  const hasConfiguredAccounts = Boolean(configuredRole?.accounts?.length);
  const useFallbackAccounts =
    fallbackToAllAccounts && !settingsQuery.isLoading && !hasConfiguredAccounts;
  const isAccountLocked =
    !allowUserSelection && selectedDefaultAccount?.canChange === false;
  const isEnabled = props.enabled !== false && !settingsQuery.isLoading;

  return (
    <SelectCustom
      // Account lists run long (taxes, settlements, advances); find one by number or name.
      search={props.search ?? true}
      {...props}
      enabled={isEnabled}
      autoSelectSingle={props.autoSelectSingle ?? !allowUserSelection}
      autoSelectValue={
        allowUserSelection
          ? props.autoSelectValue
          : (props.autoSelectValue ?? selectedDefaultAccount?.chartAccountId)
      }
      autoSelectKeys={
        props.autoSelectKeys?.length ? props.autoSelectKeys : ["id"]
      }
      path={
        useFallbackAccounts
          ? "manuals/chart-accounts"
          : documentAccountChartAccountsPath(documentTypeId)
      }
      queryParams={useFallbackAccounts ? undefined : { documentRoleCode }}
      displayConfig={{
        ...chartAccountSelectDisplayConfig,
        selectedLabel: chartAccountNumberSelectedLabel,
      }}
      disabled={
        props.disabled ||
        props.enabled === false ||
        settingsQuery.isLoading ||
        isAccountLocked
      }
    />
  );
}
