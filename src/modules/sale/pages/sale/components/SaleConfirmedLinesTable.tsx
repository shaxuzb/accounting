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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      title: t("common.rowNumber"),
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: t("app.fields.marking"),
      dataIndex: "markingNumber",
      minWidth: 260,
      render: (value) => <LineClampCell text={value ? String(value) : null} />,
    },
    {
      title: t("warehouse.fields.costPrice"),
      dataIndex: "costPrice",
      width: 140,
      align: "right",
      render: (value: number) => `${getNumber(value)} ${currency}`,
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
    {
      title: t("openingInventory.fields.price"),
      dataIndex: "amount",
      width: 160,
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
