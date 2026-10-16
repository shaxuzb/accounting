import { Button, Table, Tooltip } from "antd";
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
import SaleUnitMarkingCell from "./SaleUnitMarkingCell";
import { useTranslation } from "react-i18next";
import { useVatPayer } from "@/shared/hooks/useVatPayer";

interface Props {
  lines: SaleDocTable[];
  loading: boolean;
  currency: string;
  /** The document's date: a non-payer's «QQSsiz» sale shows no VAT columns. */
  docDate?: string | null;
  /**
   * A posted document: its cost is what the batches gave (FIFO / average), the figure 9120 was
   * debited with, so the cost and gross profit are shown. Rate: UZS for one unit of the currency.
   */
  actualCost?: { exchangeRate?: number | null } | null;
}

const getNumber = (value: number) => numberSpacing(value, undefined, true);

export default function SaleConfirmedLinesTable({
  lines,
  loading,
  currency,
  docDate,
  actualCost,
}: Props) {
  const { t } = useTranslation();
  const vatPayer = useVatPayer(docDate);
  const hideVat =
    !vatPayer.isVatPayer && lines.every((line) => !Number(line.vatAmount));
  const withoutVat = <T,>(list: TableColumnsType<T>) =>
    hideVat
      ? list.filter(
          (column) =>
            !("dataIndex" in column) ||
            (column.dataIndex !== "vatRateName" && column.dataIndex !== "vatAmount"),
        )
      : list;
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);
  const groups = useMemo(() => groupSaleDocumentLines(lines), [lines]);
  const rate = actualCost?.exchangeRate && actualCost.exchangeRate > 1 ? actualCost.exchangeRate : 1;
  const showCost = Boolean(actualCost) && groups.some((group) => group.costAmount > 0);
  // net revenue in UZS less the cost: 1C «Валовая прибыль» (9010 − 9120)
  const grossProfit = (group: SaleDocumentLineGroup) =>
    Math.round((group.amount * rate - group.costAmount) * 100) / 100;

  const toggleExpanded = (key: Key) => {
    setExpandedRowKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const itemColumns: TableColumnsType<SaleDocTable> = [
    {
      title: t("common.rowNumber"),
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: t("app.fields.marking"),
      dataIndex: "markingNumber",
      minWidth: 260,
      render: (value) => <SaleUnitMarkingCell markingNumber={value} />,
    },
    {
      title: t("warehouse.fields.costPrice"),
      dataIndex: "costPrice",
      width: 140,
      align: "right",
      render: (value: number) => `${getNumber(value)} UZS`,
    },
    {
      title: t("sale.fields.salePrice"),
      dataIndex: "amount",
      width: 150,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
    },
    {
      title: t("settings.fields.vatRate"),
      dataIndex: "vatRateName",
      width: 120,
      align: "center",
      render: (value) => value || "-",
    },
    {
      title: t("sale.fields.vatAmount"),
      dataIndex: "vatAmount",
      width: 150,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
    },
    {
      title: t("common.total"),
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
      title: t("purchase.fields.product"),
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
      title: t("purchase.fields.quantity"),
      dataIndex: "quantity",
      width: 120,
      align: "center",
      render: (value: number, record) =>
        `${value} ${record.unitName || t("sale.fields.piece")}`,
    },
    {
      title: t("sale.fields.unitPrice"),
      dataIndex: "unitPrice",
      width: 160,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
    },
    ...(groups.some((group) => group.discountPercent)
      ? [
          {
            title: t("sale.fields.discount"),
            dataIndex: "discountPercent",
            width: 110,
            align: "center" as const,
            render: (value?: number) => (value ? `${value} %` : "-"),
          },
        ]
      : []),
    {
      title: t("openingInventory.fields.price"),
      dataIndex: "amount",
      width: 160,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
    },
    ...(showCost
      ? ([
          {
            title: (
              <Tooltip title={t("sale.fields.actualCostHint")}>{t("sale.fields.actualCost")}</Tooltip>
            ),
            dataIndex: "costAmount",
            width: 170,
            align: "right",
            render: (value: number) => `${getNumber(value)} UZS`,
          },
          {
            title: (
              <Tooltip title={t("sale.fields.grossProfitHint")}>{t("sale.fields.grossProfit")}</Tooltip>
            ),
            key: "grossProfit",
            width: 190,
            align: "right",
            render: (_: unknown, group: SaleDocumentLineGroup) => {
              const profit = grossProfit(group);
              const percent = group.costAmount > 0 ? (profit / group.costAmount) * 100 : null;
              return (
                <span className={profit < 0 ? "text-red-600 dark:text-red-400" : "text-green-700 dark:text-green-400"}>
                  {getNumber(profit)} UZS
                  {percent != null && <span className="ml-1 text-xs">({getNumber(Math.round(percent * 100) / 100)} %)</span>}
                </span>
              );
            },
          },
        ] as TableColumnsType<SaleDocumentLineGroup>)
      : []),
    {
      title: t("settings.fields.vatRate"),
      dataIndex: "vatRateName",
      width: 120,
      align: "center",
      render: (value) => value || "-",
    },
    {
      title: t("sale.fields.vatAmount"),
      dataIndex: "vatAmount",
      width: 160,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
    },
    {
      title: t("common.total"),
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
      columns={withoutVat(columns)}
      dataSource={generateKeyTable(groups, "key")}
      pagination={false}
      size="large"
      scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
      expandable={{
        expandedRowKeys,
        showExpandColumn: false,
        expandedRowRender: (record) => (
          <Table<SaleDocTable>
            columns={withoutVat(itemColumns)}
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
