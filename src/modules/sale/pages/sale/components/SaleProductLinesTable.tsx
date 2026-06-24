import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import InputNumberFormat from "@/components/fields/InputNumber";
import LineClampCell from "@/components/widget/text/LineClampCell";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import type { SalePricingLine } from "../types/type";
import { getVatAmount } from "../utils/pricing";

interface Props {
  lines: SalePricingLine[];
  currencyCode: string;
  vatRateName?: string | null;
  onMarginChange: (lineKey: string, margin: number) => void;
  onSalePriceChange: (lineKey: string, salePrice: number) => void;
}

export default function SaleProductLinesTable({
  lines,
  currencyCode,
  vatRateName,
  onMarginChange,
  onSalePriceChange,
}: Props) {
  const columns: ColumnsType<SalePricingLine> = [
    { title: "ID", dataIndex: "id", width: 74 },
    {
      dataIndex: "markingNumber",
      title: "Markirovka",
      width: 190,
      render: (value) => (
        <LineClampCell text={value ? String(value) : null} />
      ),
    },
    {
      dataIndex: "costPrice",
      title: "Tannarx",
      width: 140,
      align: "right",
      render: (value: number) =>
        `${numberSpacing(value, undefined, true)} ${currencyCode}`,
    },
    {
      dataIndex: "marginPercent",
      title: "Marja, %",
      width: 130,
      render: (value, line) => (
        <InputNumberFormat
          standalone
          min={-100}
          max={100000}
          precision={2}
          value={value}
          onValueChange={(margin) =>
            onMarginChange(line.rowKey, Number(margin ?? 0))
          }
        />
      ),
    },
    {
      dataIndex: "amount",
      title: "Sotuv narxi",
      width: 160,
      render: (value, line) => (
        <InputNumberFormat
          standalone
          min={0}
          precision={2}
          value={value}
          onValueChange={(salePrice) =>
            onSalePriceChange(line.rowKey, Number(salePrice ?? 0))
          }
        />
      ),
    },
    {
      dataIndex: "quantity",
      title: "Miqdor",
      width: 100,
      align: "center",
      render: (value: number, line) =>
        `${value} ${line.unitName || "dona"}`,
    },
    {
      dataIndex: "vatRateName",
      title: "QQS",
      width: 120,
      render: (value) => vatRateName || value || "-",
    },
    {
      dataIndex: "vatAmount",
      title: "QQS summasi",
      width: 140,
      align: "right",
      render: (_, line) =>
        numberSpacing(
          getVatAmount(
            line.amount,
            line.quantity,
            vatRateName || line.vatRateName,
          ),
          undefined,
          true,
        ),
    },
    {
      dataIndex: "totalAmount",
      title: "Jami",
      width: 150,
      align: "right",
      render: (_, line) => (
        <span className="font-semibold">
          {numberSpacing(line.amount * line.quantity, undefined, true)}{" "}
          {currencyCode}
        </span>
      ),
    },
  ];
  return (
    <Table<SalePricingLine>
      size="small"
      columns={columns}
      dataSource={generateKeyTable(lines, "rowKey")}
      pagination={false}
      scroll={{ x: 1250 }}
    />
  );
}
