import { Empty, Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import Card from "@/components/ui/card/Card";
import { generateKeyTable } from "@/utils/utils";
import { getArrayFromResponse, isObject } from "../utils/response";

interface Props {
  data: unknown;
  title: string;
  emptyText?: string;
  loading?: boolean;
  onRowClick?: (record: Record<string, unknown>) => void;
}

const humanizeKey = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return JSON.stringify(value);
  if (isObject(value)) return JSON.stringify(value);
  return String(value);
};

export default function AccountingReportGenericArrayTable({
  data,
  title,
  emptyText = "Ma'lumot topilmadi",
  loading = false,
  onRowClick,
}: Props) {
  const rows = getArrayFromResponse(data);
  const normalizedRows = rows.map((row) =>
    isObject(row) ? row : { value: formatValue(row) },
  );
  const firstRow = normalizedRows[0] as Record<string, unknown> | undefined;
  const columns: ColumnsType<Record<string, unknown>> = firstRow
    ? Object.keys(firstRow).map((key) => ({
        title: humanizeKey(key),
        dataIndex: key,
        render: (value) => formatValue(value),
      }))
    : [{
          title: "Value",
          dataIndex: "value",
          render: (value) => formatValue(value),
        }];

  const handleRow: TableProps<Record<string, unknown>>["onRow"] = onRowClick
    ? (record) => ({
        onClick: () => onRowClick(record),
        className: "cursor-pointer hover:bg-muted/30",
      })
    : undefined;

  if (!rows.length || !columns.length) {
    return (
      <Card className="overflow-hidden border border-border">
        <div className="border-b border-border px-4 py-3">
          <div className="text-base font-semibold text-text">{title}</div>
        </div>
        <div className="px-4 py-8">
          <Empty description={emptyText} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-border">
      <div className="border-b border-border px-4 py-3">
        <div className="text-base font-semibold text-text">{title}</div>
      </div>
      <Table
        bordered
        size="middle"
        columns={columns}
        loading={loading}
        dataSource={generateKeyTable(normalizedRows)}
        onRow={handleRow}
        rowClassName={onRowClick ? "transition-colors" : ""}
        pagination={false}
        locale={{ emptyText }}
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
}
