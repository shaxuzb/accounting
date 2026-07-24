import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import Card from "@/components/ui/card/Card";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
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

const formatValue = (value: unknown, key = "") => {
  if (value === null || value === undefined || value === "") return "-";

  if (typeof value === "number") {
    return value === 0 ? "0" : numberSpacing(value, " ", true);
  }

  if (typeof value === "boolean") return value ? "Ha" : "Yo'q";

  if (Array.isArray(value)) return JSON.stringify(value);

  if (typeof value === "string" && key) {
    const lowerKey = key.toLowerCase();
    if (
      (lowerKey.includes("date") || lowerKey.includes("time")) &&
      !Number.isNaN(Date.parse(value))
    ) {
      return customDate(value);
    }
  }

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
  const columnKeys = normalizedRows.reduce<string[]>((keys, row) => {
    if (!isObject(row)) return keys;
    for (const key of Object.keys(row as Record<string, unknown>)) {
      if (!keys.includes(key)) keys.push(key);
    }
    return keys;
  }, []);

  const columns: ColumnsType<Record<string, unknown>> = firstRow && columnKeys.length
    ? columnKeys.map((key) => ({
        title: humanizeKey(key),
        dataIndex: key,
        render: (value) => formatValue(value, key),
      }))
    : [{
          title: "Value",
          dataIndex: "value",
          render: (value) => formatValue(value),
        }];

  const handleRow: TableProps<Record<string, unknown>>["onRow"] = onRowClick
    ? (record) => ({
        onClick: () => onRowClick(record),
        className: "cursor-pointer hover:bg-surface-hover",
      })
    : undefined;

  return (
    <Card className="overflow-hidden border border-border">
      <Table<Record<string, unknown>>
        bordered
        size="middle"
        title={() => <div className="text-base font-semibold text-text">{title}</div>}
        columns={columns}
        loading={loading}
        dataSource={generateKeyTable(normalizedRows)}
        onRow={handleRow}
        rowClassName={onRowClick ? "transition-colors" : ""}
        pagination={false}
        locale={{ emptyText }}
        scroll={{ x: "max-content", y: "calc(100vh - 340px)" }}
      />
    </Card>
  );
}
