import { Table } from "antd";
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
  emptyText = "Ma'lumot yo'q",
}: Props<T>) {
  return (
    <Card className="overflow-hidden border border-border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <div className="text-base font-semibold text-text">{title}</div>
          {total !== undefined && (
            <div className="text-xs text-secondary-text">Jami: {total}</div>
          )}
        </div>
      </div>
      <Table<T>
        bordered
        size="middle"
        columns={columns}
        dataSource={generateKeyTable(dataSource)}
        pagination={false}
        locale={{ emptyText }}
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
}
