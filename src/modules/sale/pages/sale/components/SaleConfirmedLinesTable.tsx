import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Menu } from "lucide-react";
import type { Key } from "react";
import { useMemo, useState } from "react";
import LineClampCell from "@/components/widget/text/LineClampCell";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import type {
  SaleDocTable,
  SaleDocumentLineGroup,
} from "../types/type";
import { groupSaleDocumentLines } from "../utils/saleDocumentGroups";

interface Props {
  lines: SaleDocTable[];
  loading: boolean;
  currency: string;
}

const getNumber = (value: number) => numberSpacing(value, undefined, true);

export default function SaleConfirmedLinesTable({
  lines,
  loading,
  currency,
}: Props) {
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);
  const groups = useMemo(() => groupSaleDocumentLines(lines), [lines]);

  const toggleExpanded = (key: Key) => {
    setExpandedRowKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const itemColumns: TableColumnsType<SaleDocTable> = [
    {
      title: "T/r",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Markirovka",
      dataIndex: "markingNumber",
      minWidth: 260,
      render: (value) => <LineClampCell text={value ? String(value) : null} />,
    },
    {
      title: "Tannarx",
      dataIndex: "costPrice",
      width: 140,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
    },
    {
      title: "Sotuv narxi",
      dataIndex: "amount",
      width: 150,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
    },
    {
      title: "QQS",
      dataIndex: "vatRateName",
      width: 120,
      align: "center",
      render: (value) => value || "-",
    },
    {
      title: "QQS summasi",
      dataIndex: "vatAmount",
      width: 150,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
    },
    {
      title: "Jami",
      dataIndex: "totalAmount",
      width: 160,
      align: "right",
      render: (value: number, line) => (
        <span className="font-semibold">
          {getNumber(value || line.amount * line.quantity)} {currency}
        </span>
      ),
    },
  ];

  const columns: TableColumnsType<SaleDocumentLineGroup> = [
    {
      dataIndex: "indexId",
      title: "CH",
      align: "center",
      width: 56,
      render: (_, record) => (
        <Button
          shape="circle"
          size="small"
          icon={<Menu className="size-4" />}
          disabled={!record.lines.length}
          onClick={() => toggleExpanded(record.key)}
        />
      ),
    },
    {
      title: "Mahsulot",
      dataIndex: "productName",
      minWidth: 280,
      render: (value, record) => (
        <div className="min-w-0">
          <LineClampCell text={value} />
          {record.productMxik && (
            <div className="mt-1 text-xs text-secondary-text">
              MXIK: {record.productMxik}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Miqdori",
      dataIndex: "quantity",
      width: 120,
      align: "center",
      render: (value: number, record) => `${value} ${record.unitName || "dona"}`,
    },
    {
      title: "Dona narxi",
      dataIndex: "unitPrice",
      width: 160,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
    },
    {
      title: "Narxi",
      dataIndex: "amount",
      width: 160,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
    },
    {
      title: "QQS",
      dataIndex: "vatRateName",
      width: 120,
      align: "center",
      render: (value) => value || "-",
    },
    {
      title: "QQS summasi",
      dataIndex: "vatAmount",
      width: 160,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
    },
    {
      title: "Jami",
      dataIndex: "totalAmount",
      width: 170,
      align: "right",
      render: (value: number) => (
        <span className="font-semibold">
          {getNumber(value)} {currency}
        </span>
      ),
    },
  ];

  return (
    <Table<SaleDocumentLineGroup>
      loading={loading}
      columns={columns}
      dataSource={generateKeyTable(groups, "key")}
      pagination={false}
      size="large"
      scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
      expandable={{
        expandedRowKeys,
        showExpandColumn: false,
        expandedRowRender: (record) => (
          <Table<SaleDocTable>
            columns={itemColumns}
            dataSource={generateKeyTable(record.lines, "rowKey")}
            pagination={false}
            size="small"
            scroll={{ x: "max-content" }}
          />
        ),
      }}
    />
  );
}
