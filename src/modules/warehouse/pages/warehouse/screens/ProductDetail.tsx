import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { ArrowLeft, Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Card from "@/components/ui/card/Card";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import { ProductStockSerialModal } from "../components";
import { useGetDetailSerialWarehouse } from "../hooks/useGetDetailSerialWarehouse";
import { useGetDetailWarehouse } from "../hooks/useGetDetailWarehouse";
import type { ProductStock } from "../types/type";

const getProductName = (record?: ProductStock | null) =>
  record?.productName || record?.name || "-";

const getSapCode = (record: ProductStock) =>
  record.sapCode || record.barcode || "-";

const getCurrency = (record?: ProductStock | null) =>
  record?.currencyCode || "USD";

const getSalePrice = (record: ProductStock) =>
  record.salePrice ?? record.price ?? 0;

const getSaleAmount = (record: ProductStock) =>
  record.saleTotalAmount ??
  record.totalSaleAmount ??
  record.saleAmount ??
  record.totalAmount ??
  0;

const formatMoney = (value: number, currencyCode: string) =>
  `${numberSpacing(value, undefined, true)} ${currencyCode}`;

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const [selectedProduct, setSelectedProduct] =
    useState<ProductStock | null>(null);

  const { data, isLoading, isFetching } = useGetDetailWarehouse({
    productGroupId: Number(id),
    page: 1,
    pageSize: 1000,
  });
  const serialProductId =
    selectedProduct?.productId ?? selectedProduct?.id ?? null;
  const serialParams = serialProductId
    ? { productId: serialProductId, page: 1, pageSize: 1000 }
    : undefined;
  const {
    data: serialData,
    isLoading: isSerialLoading,
    isFetching: isSerialFetching,
  } = useGetDetailSerialWarehouse(serialParams);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + getSaleAmount(item), 0),
    [items],
  );
  const currencyCode = getCurrency(items[0]);

  const columns: TableColumnsType<ProductStock> = [
    {
      dataIndex: "actions",
      title: "CH",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Button
          shape="circle"
          icon={<Menu className="size-4" />}
          onClick={() => setSelectedProduct(record)}
        />
      ),
    },
    {
      dataIndex: "name",
      title: "Mahsulot nomi",
      minWidth: 240,
      render: (_, record) => getProductName(record),
    },
    {
      dataIndex: "sapCode",
      title: "SAP kodi",
      width: 180,
      render: (_, record) => getSapCode(record),
    },
    {
      dataIndex: "quantity",
      title: "Qoldiq",
      width: 140,
      align: "center",
      render: (value: number) => numberSpacing(value, undefined, true),
    },
    {
      dataIndex: "unitName",
      title: "Birlik",
      width: 140,
      render: (value) => value || "-",
    },
    {
      dataIndex: "price",
      title: "Sotuv narxi",
      width: 180,
      align: "right",
      render: (_, record) =>
        formatMoney(getSalePrice(record), getCurrency(record)),
    },
    {
      dataIndex: "totalAmount",
      title: "Jami sotuv narxi",
      width: 220,
      align: "right",
      render: (_, record) =>
        formatMoney(getSaleAmount(record), getCurrency(record)),
    },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-3">
        <Button
          icon={<ArrowLeft className="size-4" />}
          onClick={() => navigate(-1)}
        >
          Orqaga
        </Button>
      </div>

      <Card className="overflow-hidden border border-border">
        <Table<ProductStock>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(items, "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6}>
                  <span className="font-semibold text-text">Jami</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  <span className="font-semibold text-text">
                    {formatMoney(totalAmount, currencyCode)}
                  </span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
      <ProductStockSerialModal
        open={Boolean(selectedProduct)}
        title={getProductName(selectedProduct)}
        items={serialData?.items ?? []}
        loading={isSerialLoading || isSerialFetching}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
