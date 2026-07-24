import type { ComponentProps } from "react";
import SelectCustom from "./SelectCustom";
import { chartAccountSelectDisplayConfig } from "@/shared/constants/selectLists";

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
  return (
    <SelectCustom
      {...props}
      path={`document-account-settings/${documentTypeId}/chart-accounts`}
      queryParams={{ documentRoleCode }}
      displayConfig={chartAccountSelectDisplayConfig}
    />
  );
}
