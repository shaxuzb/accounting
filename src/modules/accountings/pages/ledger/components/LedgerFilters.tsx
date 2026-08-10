import type { FormikProps } from "formik";
import SelectCustom from "@/components/fields/SelectCustom";
import AccountingReportFilterBar from "@/modules/accountings/pages/accounting-report/components/AccountingReportFilterBar";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import type { LedgerQuery } from "../types/type";

interface Props {
  formik: FormikProps<LedgerQuery>;
  loading: boolean;
  onAccountChange: (accountId: number | null) => void;
  onDateChange: (dateFrom: string, dateTo: string) => void;
  onRefresh: () => void;
}

export default function LedgerFilters({
  formik,
  loading,
  onAccountChange,
  onDateChange,
  onRefresh,
}: Props) {

  return (
    <AccountingReportFilterBar
      formik={formik}
      loading={loading}
      refreshDisabled={!formik.values.accountId}
      onDateChange={onDateChange}
      onRefresh={onRefresh}
    >
      <div>
        <SelectCustom
          formik={formik}
          fieldName="accountId"
          placeholder="app.reports.fields.account"
          path={selectListEndpoints.chartAccountsSelectList}
          clearable
          search
          marginBottom="0"
          optionLabel={chartAccountOptionLabel}
          selectedLabel={chartAccountSelectedLabel}
          onChange={(value) =>
            onAccountChange(typeof value === "number" ? value : null)
          }
        />
      </div>
    </AccountingReportFilterBar>
  );
}
