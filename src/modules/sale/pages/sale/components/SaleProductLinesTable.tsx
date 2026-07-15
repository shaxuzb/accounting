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
    { title: "ID", dataIndex: "id" },
    // {
    //   dataIndex: "purchaseDocNumber",
    //   title: "Kirim hujjati",
    //   width: 150,
    //   render: (value) => value || "-",
    // },
    // {
    //   dataIndex: "purchaseDate",
    //   title: "Kirim sanasi",
    //   width: 130,
    //   render: (value) => formatDate(value),
    // },
    {
      dataIndex: "markingNumber",
      title: "Markirovka",
      width: 280,
      render: (value) => {
        return (
          <div className="w-70 ">
            <LineClampCell text={value} />
          </div>
        );
      },
    },
    {
      dataIndex: "costPrice",
      title: "Tannarx",
      render: (value: number) =>
        `${numberSpacing(value, undefined, true)} ${currencyCode}`,
    },
    {
      dataIndex: "marginPercent",
      title: "Marja, %",
      width: 120,
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
      width: 120,
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
      align: "center",
      render: (value: number, line) => `${value} ${line.unitName || "dona"}`,
    },
    {
      dataIndex: "vatRateName",
      title: "QQS",
      render: (value) => vatRateName || value || "-",
    },
    {
      dataIndex: "vatAmount",
      title: "QQS summasi",
      align: "center",
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
      align: "center",
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
      scroll={{ x: "max-content" }}
    />
  );
}
