import { useParams } from "react-router";
import { Descriptions, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { formatDate, generateKeyTable } from "@/utils/utils";
import { useGetDetailPurchase } from "../../hooks/useGetDetailPurchase";
import type { PurchaseDetailProductData } from "../../types/type";

const formatAmount = (value?: number | null) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const formatCurrency = (value: number, currencyId?: number) => {
  const code = currencyId === 2 ? "USD" : "UZS";
  return `${formatAmount(value)} ${code}`;
};

export default function PurchaseDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const { data, isLoading, isFetching } = useGetDetailPurchase(params.id ?? "");

  const columns: TableColumnsType<PurchaseDetailProductData> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "product",
      title: t("purchase.fields.product"),
      minWidth: 220,
    },
    {
      dataIndex: "sapCode",
      title: t("purchase.fields.sapCode"),
      align: "center",
      width: 130,
    },
    {
      dataIndex: "qty",
      title: t("purchase.fields.quantity"),
      align: "right",
      width: 110,
    },
    {
      dataIndex: "pricePerUom",
      title: t("purchase.fields.price"),
      align: "right",
      width: 150,
      render: (value, record) => formatCurrency(Number(value), record.currencyId),
    },
    {
      dataIndex: "discountPercent",
      title: t("purchase.fields.discount"),
      align: "right",
      width: 120,
      render: (value) => `${formatAmount(Number(value))}%`,
    },
    {
      dataIndex: "lineTotal",
      title: t("purchase.fields.total"),
      align: "right",
      width: 170,
      render: (_, record) =>
        formatCurrency(
          Number(record.pricePerUom ?? 0) *
            Number(record.qty ?? 0) *
            ((100 - Number(record.discountPercent ?? 0)) / 100),
          record.currencyId,
        ),
    },
    {
      dataIndex: "baseUom",
      title: t("purchase.fields.uom"),
      align: "center",
      width: 110,
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border border-border p-4">
        <Descriptions
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
          size="small"
          items={[
            {
              key: "docNumber",
              label: t("purchase.fields.docNumber"),
              children: data?.docNumber ?? "-",
            },
            {
              key: "docDate",
              label: t("purchase.fields.docDate"),
              children: formatDate(data?.docDate),
            },
            {
              key: "supplier",
              label: t("purchase.fields.supplier"),
              children: data?.supplier ?? "-",
            },
            {
              key: "contract",
              label: t("purchase.fields.contract"),
              children: data?.contractName ?? "-",
            },
            {
              key: "description",
              label: t("purchase.fields.description"),
              children: data?.description ?? "-",
            },
            {
              key: "status",
              label: t("settings.fields.status"),
              children: <Tag color="blue">{data?.status ?? "-"}</Tag>,
            },
          ]}
        />
      </Card>
      <Card className="overflow-hidden border border-border">
        <Table<PurchaseDetailProductData>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.goodsMovementProducts ?? [], "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 360px)" }}
        />
      </Card>
    </div>
  );
}
