import { Button } from "antd";
import type { FormikProps } from "formik";
import { FileSpreadsheet, Printer, RefreshCw } from "lucide-react";
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
  /** Excel and print of what the report shows; the buttons show when given. */
  onExcel?: () => void;
  onPrint?: () => void;
  outputDisabled?: boolean;
}

export default function AccountingReportFilterBar<T extends object>({
  formik,
  loading,
  onDateChange,
  onRefresh,
  refreshDisabled = false,
  children,
  afterDate,
  onExcel,
  onPrint,
  outputDisabled = false,
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

        <div className="flex shrink-0 gap-2">
          {onPrint && (
            <Button icon={<Printer className="size-4" />} disabled={outputDisabled} onClick={onPrint}>
              {t("app.reports.print")}
            </Button>
          )}
          {onExcel && (
            <Button icon={<FileSpreadsheet className="size-4" />} disabled={outputDisabled} onClick={onExcel}>
              Excel
            </Button>
          )}
        <Button
          icon={<RefreshCw className="size-4" />}
          loading={loading}
          disabled={refreshDisabled}
          onClick={onRefresh}
          aria-label={t("common.refresh")}
          className="shrink-0"
        />
        </div>
      </div>
    </Card>
  );
}
