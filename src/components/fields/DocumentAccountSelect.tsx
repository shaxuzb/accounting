import type { ComponentProps } from "react";
import SelectCustom from "./SelectCustom";
import { useGetDetailDocumentAccountSettings } from "@/modules/settings/pages/documentAccountSettings/hooks";
import {
  chartAccountNumberSelectedLabel,
  chartAccountSelectDisplayConfig,
} from "@/shared/constants/selectLists";

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
};

export default function DocumentAccountSelect({
  documentTypeId,
  documentRoleCode,
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
  const isEnabled = props.enabled !== false && !settingsQuery.isLoading;

  return (
    <SelectCustom
      {...props}
      enabled={isEnabled}
      autoSelectValue={props.autoSelectValue ?? defaultAccount?.chartAccountId}
      autoSelectKeys={
        props.autoSelectKeys?.length ? props.autoSelectKeys : ["id"]
      }
      path={`document-account-settings/${documentTypeId}/chart-accounts`}
      queryParams={{ documentRoleCode }}
      displayConfig={{
        ...chartAccountSelectDisplayConfig,
        selectedLabel: chartAccountNumberSelectedLabel,
      }}
    />
  );
}
