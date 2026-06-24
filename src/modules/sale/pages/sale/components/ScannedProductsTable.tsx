import { Button, Popconfirm, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { LoaderCircle, Trash2 } from "lucide-react";
import type { SaleScannedProduct } from "../types/type";

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
  const columns: TableColumnsType<SaleScannedProduct> = [
    {
      dataIndex: "indexId",
      title: "№",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      dataIndex: "markingNumber",
      title: "Markirovka",
      width: 220,
    },
    {
      dataIndex: "productName",
      title: "Mahsulot",
      minWidth: 240,
    },
    {
      dataIndex: "scanStatus",
      title: "Holat",
      width: 120,
      align: "center",
      render: (status) =>
        status === "pending" ? (
          <Tag
            icon={<LoaderCircle className="size-3 animate-spin" />}
            color="processing"
          >
            Kutilmoqda
          </Tag>
        ) : (
          <Tag color="success">Tasdiqlandi</Tag>
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
          title="Mahsulotni o'chirasizmi?"
          okText="Ha"
          cancelText="Yo'q"
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
      locale={{ emptyText: "Barcode orqali mahsulot qo'shing" }}
    />
  );
}
