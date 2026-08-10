import { Button } from "antd";
import type { FormikProps } from "formik";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import SelectFromToDate from "@/components/fields/SelectFromToDate";
import Card from "@/components/ui/card/Card";
import type { AccountTurnoverQuery } from "../types/type";

interface Props {
  formik: FormikProps<AccountTurnoverQuery>;
  loading: boolean;
  onDateChange: (dateFrom: string, dateTo: string) => void;
  onRefresh: () => void;
}

export default function AccountTurnoverFilterBar({
  formik,
  loading,
  onDateChange,
  onRefresh,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card className=" p-2 mt-2">
      <div className="flex justify-between gap-4 ">
        <SelectFromToDate
          formik={formik}
          fieldName="dateFrom,dateTo"
          placeholder="app.reports.fields.dateFrom,app.reports.fields.dateTo"
          onDateChange={onDateChange}
        />

        <Button
          icon={<RefreshCw className="size-4" />}
          loading={loading}
          onClick={onRefresh}
          aria-label={t("common.refresh")}
        />
      </div>
    </Card>
  );
}
