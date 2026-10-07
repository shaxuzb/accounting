import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import InputNumberFormat from "@/components/fields/InputNumber";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import type { SalePricingLine } from "../types/type";
import { getLineTotal, getVatAmount } from "../utils/pricing";
import SaleUnitMarkingCell from "./SaleUnitMarkingCell";
import { useTranslation } from "react-i18next";

interface Props {
  lines: SalePricingLine[];
  currencyCode: string;
  vatRateName?: string | null;
  onMarginChange: (lineKey: string, margin: number) => void;
  onSalePriceChange: (lineKey: string, salePrice: number) => void;
  /** A non-payer sells «QQSsiz»: no VAT rate or amount columns. */
  vatPayer?: boolean;
}

export default function SaleProductLinesTable({
  lines,
  currencyCode,
  vatRateName,
  onMarginChange,
  onSalePriceChange,
  vatPayer = true,
}: Props) {
  const { t } = useTranslation();
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
      title: t("app.fields.marking"),
      width: 280,
      // A listed unit shows its code or says it has none; a line kept by quantity
      // has no units to show.
      render: (value, record) => (
        <div className="w-70">
          {record.ownerId ? <SaleUnitMarkingCell markingNumber={value} /> : "—"}
        </div>
      ),
    },
    {
      dataIndex: "costPrice",
      title: t("warehouse.fields.costPrice"),
      // the stock cost is in UZS; in a foreign-currency sale it is shown in that
      // currency too, the one the margin is counted in
      render: (value: number, line) =>
        currencyCode === "UZS" ? (
          `${numberSpacing(value, undefined, true)} UZS`
        ) : (
          <div>
            <div>
              {numberSpacing(line.docCostPrice, undefined, true)} {currencyCode}
            </div>
            <div className="text-xs text-secondary-text">
              {numberSpacing(value, undefined, true)} UZS
            </div>
          </div>
        ),
    },
    {
      dataIndex: "marginPercent",
      title: t("sale.fields.margin"),
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
      title: vatPayer ? t("sale.fields.salePrice") : t("sale.fields.price"),
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
      title: t("openingInventory.fields.quantity"),
      align: "center",
      render: (value: number, line) =>
        `${value} ${line.unitName || t("sale.fields.piece")}`,
    },
    {
      dataIndex: "vatRateName",
      title: t("settings.fields.vatRate"),
      render: (value) => vatRateName || value || "-",
    },
    {
      dataIndex: "vatAmount",
      title: t("sale.fields.vatAmount"),
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
      title: t("common.total"),
      align: "center",
      render: (_, line) => (
        <span className="font-semibold">
          {numberSpacing(
            getLineTotal(line.amount, line.quantity, vatRateName || line.vatRateName),
            undefined,
            true,
          )}{" "}
          {currencyCode}
        </span>
      ),
    },
  ];
  return (
    <Table<SalePricingLine>
      size="small"
      columns={
        vatPayer
          ? columns
          : columns.filter(
              (column) =>
                !("dataIndex" in column) ||
                (column.dataIndex !== "vatRateName" &&
                  column.dataIndex !== "vatAmount"),
            )
      }
      dataSource={generateKeyTable(lines, "rowKey")}
      pagination={false}
      scroll={{ x: "max-content" }}
    />
  );
}
