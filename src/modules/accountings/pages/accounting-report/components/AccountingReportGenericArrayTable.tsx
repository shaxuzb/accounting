import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import Card from "@/components/ui/card/Card";
import { generateKeyTable } from "@/utils/utils";
import { getArrayFromResponse, isObject } from "../utils/response";

interface Props {
  data: unknown;
  title: string;
  emptyText?: string;
}

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
}: Props) {
  const rows = getArrayFromResponse(data);
  const firstRow = rows[0];
  const columns: ColumnsType<Record<string, unknown>> = isObject(firstRow)
    ? Object.keys(firstRow).map((key) => ({
        title: key,
        dataIndex: key,
        render: (value) => formatValue(value),
      }))
    : [];

  if (!rows.length || !columns.length) return null;

  return (
    <Card className="overflow-hidden border border-border">
      <div className="border-b border-border px-4 py-3">
        <div className="text-base font-semibold text-text">{title}</div>
      </div>
      <Table
        bordered
        size="middle"
        columns={columns}
        dataSource={generateKeyTable(rows as Record<string, unknown>[]) }
        pagination={false}
        locale={{ emptyText }}
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
}
