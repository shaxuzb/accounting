import { Table } from "antd";
import type { TableColumnsType } from "antd";
import { Link, useSearchParams } from "react-router";
import Card from "@/components/ui/card/Card";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import { useGetListWarehouse } from "../hooks/useGetListWarehouse";
import type { ProductStock } from "../types/type";

const getProductName = (record: ProductStock) =>
  record.productTypeName || record.productName || record.name || "-";

const getCurrency = (record?: ProductStock) => record?.currencyCode || "USD";

const getPurchaseAmount = (record: ProductStock) =>
  record.purchaseTotalAmount ??
  record.totalPurchaseAmount ??
  record.purchaseAmount ??
  record.purchaseSum ??
  0;

const getSaleAmount = (record: ProductStock) =>
  record.saleTotalAmount ??
  record.totalSaleAmount ??
  record.saleAmount ??
  record.saleSum ??
  record.totalAmount ??
  0;

const formatMoney = (value: number, currencyCode: string) =>
  `${numberSpacing(value, undefined, true)} ${currencyCode}`;

export default function ProductSummaryListPage() {
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching } = useGetListWarehouse(searchParams);
  const items = data?.items ?? [];

  const columns: TableColumnsType<ProductStock> = [
    {
      dataIndex: "indexId",
      title: "T/r",
      width: 80,
      align: "center",
    },
    {
      dataIndex: "name",
      title: "Mahsulot turi",
      minWidth: 260,
      render: (_, record) => (
        <Link to={`${record.id}`} className="text-primary hover:underline">
          {getProductName(record)}
        </Link>
      ),
    },
    {
      dataIndex: "quantity",
      title: "Miqdori",
      width: 160,
      align: "center",
      render: (value: number) => numberSpacing(value, undefined, true),
    },
    {
      dataIndex: "purchaseAmount",
      title: "Xarid summa USD",
      width: 240,
      align: "right",
      render: (_, record) =>
        formatMoney(getPurchaseAmount(record), getCurrency(record)),
    },
    {
      dataIndex: "saleAmount",
      title: "Sotuv summa USD",
      width: 240,
      align: "right",
      render: (_, record) =>
        formatMoney(getSaleAmount(record), getCurrency(record)),
    },
  ];

  return (
    <Card className="overflow-hidden border border-border">
      <Table<ProductStock>
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={generateKeyTable(items, "id")}
        pagination={false}
        scroll={{ x: "max-content", y: "calc(100vh - 260px)" }}
      />
    </Card>
  );
}
