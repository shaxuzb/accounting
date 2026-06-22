import { Table } from "antd";
import type { TableColumnsType } from "antd";
import Card from "@/components/ui/card/Card";
import LineClampCell from "@/components/widget/text/LineClampCell";
import { numberSpacing } from "@/utils/utils";
import type { SaleDoc, SaleDocTable } from "../types/type";
import SaleDocumentSummary from "./SaleDocumentSummary";

interface Props {
  document: SaleDoc;
  lines: SaleDocTable[];
  loading: boolean;
  organizationName: string;
}

export default function SaleCompletedDocument({
  document,
  lines,
  loading,
  organizationName,
}: Props) {
  const currency = document.currencyCode || "UZS";
  const totalAmount = lines.reduce(
    (sum, line) => sum + (line.totalAmount || line.amount * line.quantity),
    0,
  );
  const columns: TableColumnsType<SaleDocTable> = [
    {
      title: "№",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mahsulot",
      dataIndex: "productName",
      minWidth: 220,
    },
    {
      title: "Markirovka",
      width: 210,
      render: (_, line) => (
        <LineClampCell
          text={line.markingNumber}
        />
      ),
    },
    {
      title: "Miqdor",
      dataIndex: "quantity",
      width: 120,
      align: "center",
      render: (value: number, line) => `${value} ${line.unitName || "dona"}`,
    },
    {
      title: "QQS",
      dataIndex: "vatRateName",
      width: 120,
      align: "center",
      render: (value: string) => value || "-",
    },
    {
      title: "Sotuv narxi",
      dataIndex: "amount",
      width: 160,
      align: "right",
      render: (value: number) =>
        `${numberSpacing(value, undefined, true)} ${currency}`,
    },
    {
      title: "QQS summasi",
      dataIndex: "vatAmount",
      width: 150,
      align: "right",
      render: (value: number) =>
        `${numberSpacing(value, undefined, true)} ${currency}`,
    },
    {
      title: "Jami",
      width: 170,
      align: "right",
      render: (_, line) => (
        <span className="font-semibold">
          {numberSpacing(
            line.totalAmount || line.amount * line.quantity,
            undefined,
            true,
          )}{" "}
          {currency}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SaleDocumentSummary
        document={document}
        organizationName={organizationName}
        totalAmount={totalAmount || document.totalAmount || 0}
      />
      <Card className="overflow-hidden border border-border">
        <Table<SaleDocTable>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={lines}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
        />
      </Card>
    </div>
  );
}
