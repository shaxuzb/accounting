import { Button } from "antd";
import type { FormikProps } from "formik";
import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import SelectFromToDate from "@/components/fields/SelectFromToDate";
import Card from "@/components/ui/card/Card";

interface Props<T extends object> {
  formik: FormikProps<T>;
  loading: boolean;
  onDateChange: (dateFrom: string, dateTo: string) => void;
  onRefresh: () => void;
  refreshDisabled?: boolean;
  children?: ReactNode;
  afterDate?: ReactNode;
}

export default function AccountingReportFilterBar<T extends object>({
  formik,
  loading,
  onDateChange,
  onRefresh,
  refreshDisabled = false,
  children,
  afterDate,
}: Props<T>) {
  const { t } = useTranslation();

  return (
    <Card className="mt-2 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {children && (
            <div className="min-w-xs [&_.ant-form-item]:mb-0! [&_.ant-select]:w-full!">
              {children}
            </div>
          )}
          <div className="w-90 max-w-full shrink-0">
            <SelectFromToDate
              formik={formik}
              fieldName="dateFrom,dateTo"
              placeholder="app.reports.fields.dateFrom,app.reports.fields.dateTo"
              onDateChange={onDateChange}
            />
          </div>
          {afterDate}
        </div>

        <Button
          icon={<RefreshCw className="size-4" />}
          loading={loading}
          disabled={refreshDisabled}
          onClick={onRefresh}
          aria-label={t("common.refresh")}
          className="shrink-0"
        />
      </div>
    </Card>
  );
}
