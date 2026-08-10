import { Switch } from "antd";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import AccountingReportFilterBar from "@/modules/accountings/pages/accounting-report/components/AccountingReportFilterBar";
import type { TrialBalanceQuery } from "../types/type";

interface Props {
  formik: FormikProps<TrialBalanceQuery>;
  loading: boolean;
  onDateChange: (dateFrom: string, dateTo: string) => void;
  onIncludeZeroBalanceChange: (checked: boolean) => void;
  onRefresh: () => void;
}

export default function TrialBalanceFilters({
  formik,
  loading,
  onDateChange,
  onIncludeZeroBalanceChange,
  onRefresh,
}: Props) {
  const { t } = useTranslation();

  return (
    <AccountingReportFilterBar
      formik={formik}
      loading={loading}
      onDateChange={onDateChange}
      onRefresh={onRefresh}
      afterDate={
        <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm text-text">
          <Switch
            checked={Boolean(formik.values.includeZeroBalance)}
            onChange={(checked) => {
              void formik.setFieldValue("includeZeroBalance", checked, false);
              onIncludeZeroBalanceChange(checked);
            }}
          />
          <span>{t("accountings.fields.includeZeroBalance")}</span>
        </label>
      }
    />
  );
}
