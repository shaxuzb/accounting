import { Empty, Table } from "antd";
import { useTranslation } from "react-i18next";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { ReactNode } from "react";
import Card from "@/components/ui/card/Card";
import { generateKeyTable } from "@/utils/utils";

interface Props<T extends object> {
  title: string;
  total?: ReactNode;
  columns: ColumnsType<T>;
  dataSource: T[];
  emptyText?: string;
  loading?: boolean;
  tone?: "default" | "primary" | "success" | "danger" | "warning" | "violet";
  metrics?: Array<{ label: string; value: ReactNode; tone?: "default" | "success" | "danger" }>;
  pagination?: false | TablePaginationConfig;
  rowKey?: string | ((record: T) => React.Key);
}

const headerToneClass = {
  default: "border-l-border",
  primary: "border-l-brand",
  success: "border-l-success",
  danger: "border-l-danger",
  warning: "border-l-warning",
  violet: "border-l-violet-600",
};

const metricToneClass = {
  default: "text-text",
  success: "text-success",
  danger: "text-danger",
};

export default function AccountingReportSectionCard<T extends object>({
  title,
  total,
  columns,
  dataSource,
  emptyText,
  loading = false,
  tone = "default",
  metrics = [],
  pagination = false,
  rowKey,
}: Props<T>) {
  const { t } = useTranslation();
  return (
    <Card className="overflow-hidden border border-border shadow-sm">
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-l-4 border-border px-4 py-3 ${headerToneClass[tone]}`}>
        <div>
          <div className="text-base font-semibold text-text">{title}</div>
          {total !== undefined && (
            <div className="text-xs text-secondary-text">
              {t("common.total")}: {total}
            </div>
          )}
        </div>
        {metrics.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-right">
                <div className="text-[11px] text-secondary-text">{metric.label}</div>
                <div className={`text-sm font-semibold tabular-nums ${metricToneClass[metric.tone ?? "default"]}`}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Table<T>
        size="middle"
        columns={columns}
        dataSource={generateKeyTable(dataSource)}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination}
        locale={{
          emptyText: <Empty description={emptyText ?? t("app.common.noData")} />,
        }}
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
}
