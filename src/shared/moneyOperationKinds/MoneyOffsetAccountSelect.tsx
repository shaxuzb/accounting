import type { FormikProps } from "formik";
import SelectCustom from "@/components/fields/SelectCustom";
import {
  chartAccountSelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { MoneyOperationKind } from "./index";

/** Money accounts themselves (cash 50xx, bank 51/52/55xx) are never the other side. */
const MONEY_PREFIXES = ["50", "51", "52", "55"];

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: FormikProps<any>;
  fieldName: string;
  label: string;
  kind?: MoneyOperationKind;
}

/**
 * The correspondent account of a cash order or bank operation as 1C offers it: the operation
 * kind narrows it (68xx for a loan, 42xx for an accountable person ...) and «Прочий приход /
 * расход» takes any account of the chart — not only those listed in the document's account
 * settings. Group accounts, off-balance accounts and money accounts are left out.
 */
export default function MoneyOffsetAccountSelect({ formik, fieldName, label, kind }: Props) {
  const prefixes = kind?.offsetPrefixes ?? [];
  return (
    <SelectCustom
      formik={formik}
      fieldName={fieldName}
      label={label}
      path={selectListEndpoints.chartAccountsSelectList}
      displayConfig={chartAccountSelectDisplayConfig}
      search
      clearable
      getFirst={false}
      autoSelectSingle={false}
      filterOption={(item) => {
        const number = String(item.number ?? "");
        if (!number || (item as { isGroup?: boolean }).isGroup || number.startsWith("0")) return false;
        if (MONEY_PREFIXES.some((prefix) => number.startsWith(prefix))) return false;
        return prefixes.length === 0 || prefixes.some((prefix) => number.startsWith(prefix));
      }}
    />
  );
}
