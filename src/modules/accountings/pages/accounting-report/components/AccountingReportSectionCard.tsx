import { Table } from "antd";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import Card from "@/components/ui/card/Card";
import { generateKeyTable } from "@/utils/utils";

interface Props<T extends object> {
  title: string;
  total?: number;
  columns: ColumnsType<T>;
  dataSource: T[];
  emptyText?: string;
}

export default function AccountingReportSectionCard<T extends object>({
  title,
  total,
  columns,
  dataSource,
  emptyText,
}: Props<T>) {
  const { t } = useTranslation();
  return (
    <Card className="space-y-3 border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-base font-semibold text-text">{title}</div>
          {total !== undefined && (
            <div className="text-xs text-secondary-text">
              {t("common.total")}: {total}
            </div>
          )}
        </div>
      </div>
      <Table<T>
        bordered
        size="middle"
        columns={columns}
        dataSource={generateKeyTable(dataSource)}
        pagination={false}
        locale={{ emptyText: emptyText ?? t("app.common.noData") }}
        scroll={{ x: "max-content", y: "calc(100vh - 440px)" }}
      />
    </Card>
  );
}
