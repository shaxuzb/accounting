import { Button, Popconfirm, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { LoaderCircle, Trash2 } from "lucide-react";
import type { SaleScannedProduct } from "../types/type";
import { useTranslation } from "react-i18next";

interface Props {
  products: SaleScannedProduct[];
  loading?: boolean;
  onDelete: (product: SaleScannedProduct) => void;
}

export default function ScannedProductsTable({
  products,
  loading = false,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const columns: TableColumnsType<SaleScannedProduct> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      dataIndex: "markingNumber",
      title: t("app.fields.marking"),
      width: 220,
    },
    {
      dataIndex: "productName",
      title: t("purchase.fields.product"),
      minWidth: 240,
    },
    {
      dataIndex: "scanStatus",
      title: t("settings.fields.status"),
      width: 120,
      align: "center",
      render: (status) =>
        status === "pending" ? (
          <Tag
            icon={<LoaderCircle className="size-3 animate-spin" />}
            color="processing"
          >
            {t("processStatuses.pending")}
          </Tag>
        ) : (
          <Tag color="success">{t("sale.messages.scanConfirmed")}</Tag>
        ),
    },
    {
      dataIndex: "actions",
      title: "",
      width: 60,
      align: "center",
      fixed: "right",
      render: (_, product) => (
        <Popconfirm
          title={t("sale.messages.deleteProductQuestion")}
          okText={t("app.common.yes")}
          cancelText={t("app.common.no")}
          onConfirm={() => onDelete(product)}
        >
          <Button danger type="text" icon={<Trash2 className="size-4" />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table<SaleScannedProduct>
      rowKey="scanId"
      columns={columns}
      dataSource={products}
      loading={loading}
      pagination={false}
      scroll={{ x: "max-content", y: "calc(100vh - 430px)" }}
      locale={{ emptyText: t("sale.messages.addByBarcode") }}
    />
  );
}
