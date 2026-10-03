import { Empty, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import SearchHighlight from "@/components/ui/table/SearchHighlight";
import { numberSpacing } from "@/utils/utils";
import { useGetPurchaseLines } from "../hooks/useGetPurchaseLines";
import type { PurchaseLineData } from "../types/type";

interface PurchaseDocLinesRowProps {
  docId: number;
  search?: string;
}

const money = (value: number, currency?: string) => (
  <span className="whitespace-nowrap tabular-nums">
    {numberSpacing(value ?? 0, undefined, true)} {currency ?? ""}
  </span>
);

/**
 * The products of one purchase document, shown when its row is expanded. While searching
 * only the matching lines are listed; the line search also matches the document number and
 * the supplier, so a document found by those lists all its lines.
 */
export default function PurchaseDocLinesRow({
  docId,
  search,
}: PurchaseDocLinesRowProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetPurchaseLines({
    docId,
    search,
    page: 1,
    pageSize: 1000,
  });

  const columns: TableColumnsType<PurchaseLineData> = [
    {
      dataIndex: "productName",
      title: t("purchase.fields.productName"),
      render: (value, record) => (
        <div className="min-w-56">
          <div>
            <SearchHighlight text={value} search={search} />
          </div>
          {record.productGroupName && (
            <div className="text-xs text-secondary-text">
              {record.productGroupName}
            </div>
          )}
        </div>
      ),
    },
    {
      dataIndex: "productMxik",
      title: t("purchase.fields.mxik"),
      render: (value) => <SearchHighlight text={value} search={search} />,
    },
    {
      dataIndex: "quantity",
      title: t("purchase.fields.quantity"),
      align: "right",
      render: (value, record) => (
        <span className="whitespace-nowrap tabular-nums">
          {numberSpacing(value, undefined, true)} {record.unitName}
        </span>
      ),
    },
    {
      dataIndex: "unitPrice",
      title: t("purchase.fields.unitPrice"),
      align: "right",
      render: (value, record) => money(value, record.currencyCode),
    },
    {
      dataIndex: "vatAmount",
      title: t("purchase.fields.vatAmount"),
      align: "right",
      render: (value, record) => money(value, record.currencyCode),
    },
    {
      dataIndex: "totalAmount",
      title: t("purchase.fields.amount"),
      align: "right",
      render: (value, record) => money(value, record.currencyCode),
    },
  ];

  return (
    <Table<PurchaseLineData>
      size="small"
      rowKey="id"
      className="my-1"
      loading={isLoading}
      columns={columns}
      dataSource={data?.items ?? []}
      pagination={false}
      scroll={{ x: "max-content" }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("purchase.messages.linesEmpty")}
          />
        ),
      }}
    />
  );
}
