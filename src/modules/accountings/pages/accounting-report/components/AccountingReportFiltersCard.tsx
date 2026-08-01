import { Button, Space } from "antd";
import type { FormikProps } from "formik";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";

interface Props<T> {
  formik: FormikProps<T>;
  loading?: boolean;
  children: ReactNode;
  actionLabel?: string;
  onReset?: () => void;
}

export default function AccountingReportFiltersCard<T>({
  formik,
  loading = false,
  children,
  actionLabel,
  onReset,
}: Props<T>) {
  const { t } = useTranslation();
  return (
    <Card className="border border-border p-4">
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {children}

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {actionLabel ?? t("app.reports.actions.show")}
          </Button>
          {onReset && (
            <Button htmlType="button" onClick={onReset}>
              {t("common.clear")}
            </Button>
          )}
        </Space>
      </form>
    </Card>
  );
}
