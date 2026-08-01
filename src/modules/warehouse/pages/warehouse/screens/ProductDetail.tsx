import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import Card from "@/components/ui/card/Card";
import { filterIds } from "@/shared/constants/selectLists";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import { ProductStockSerialModal } from "../components";
import { useGetDetailSerialWarehouse } from "../hooks/useGetDetailSerialWarehouse";
import { useGetDetailWarehouse } from "../hooks/useGetDetailWarehouse";
import type { ProductStock } from "../types/type";
import { useTranslation } from "react-i18next";

const getProductName = (record?: ProductStock | null) =>
  record?.productName || record?.name || "-";

const formatMoney = (value: number, currencyCode?: string) => {
  const formatted = numberSpacing(value, undefined, true);
  return currencyCode ? `${formatted} ${currencyCode}` : formatted;
};

export default function ProductDetail() {
  const { t } = useTranslation();
  // const navigate = useNavigate();
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<ProductStock | null>(
    null,
  );

  const productGroupId = Number(id) || null;
  const warehouseIdParam = searchParams.get(filterIds.warehouse);
  const warehouseId = warehouseIdParam ? Number(warehouseIdParam) : null;
  const { data, isLoading, isFetching } = useGetDetailWarehouse({
    productGroupId,
    page: 1,
    pageSize: 1000,
    warehouseId,
  });

  const serialProductId =
    selectedProduct?.productId ?? selectedProduct?.id ?? null;
  const {
    data: serialData,
    isLoading: isSerialLoading,
    isFetching: isSerialFetching,
  } = useGetDetailSerialWarehouse(
    serialProductId
      ? {
          productId: serialProductId,
          page: 1,
          pageSize: 1000,
          warehouseId,
        }
      : undefined,
  );

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0),
    [items],
  );
  const currencyCode = items[0]?.currencyCode;

  const columns: TableColumnsType<ProductStock> = [
    {
      dataIndex: "actions",
      title: "CH",
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
      title: t("warehouse.fields.productName"),
      render: (_, record) => getProductName(record),
    },
    {
      dataIndex: "mxik",
      title: t("warehouse.fields.mxik"),
      align: "center",
    },
    {
      dataIndex: "quantity",
      title: t("app.reports.fields.balance"),
      align: "center",
      render: (value: number) => numberSpacing(value, undefined, true),
    },
    {
      dataIndex: "unitName",
      title: t("purchase.fields.unit"),
      render: (value) => value || "-",
    },
    {
      dataIndex: "costPrice",
      title: t("warehouse.fields.salesPrice"),
      align: "center",
      render: (_, record) => numberSpacing(record.costPrice),
    },
    {
      dataIndex: "totalAmount",
      title: t("warehouse.fields.totalSalesPrice"),
      align: "center",
      render: (value: number, record) =>
        formatMoney(value ?? 0, record.currencyCode),
    },
  ];

  return (
    <div className="w-full space-y-3">
      {/* <div className="flex items-center gap-3">
        <Button
          icon={<ArrowLeft className="size-4" />}
          onClick={() => navigate(-1)}
        >
          Orqaga
        </Button>
      </div> */}

      <Card className="overflow-hidden border border-border">
        <Table<ProductStock>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(items)}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6}>
                  <span className="font-semibold text-text">
                    {t("common.total")}
                  </span>
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
