import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Menu } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import SearchHighlight from "@/components/ui/table/SearchHighlight";
import ProductStockSerialModal from "./ProductStockSerialModal";
import { useGetDetailSerialWarehouse } from "../hooks/useGetDetailSerialWarehouse";
import type { ProductStock } from "../types/type";

const getProductName = (record?: ProductStock | null) =>
  record?.productName || record?.name || "-";

/**
 * /product-stocks/products gives no price of its own: the cost of the stock is in its
 * batches, so the average cost and the total are taken from them.
 */
const withBatchCost = (item: ProductStock): ProductStock => {
  const batches = item.batches ?? [];
  if (batches.length === 0) return item;

  const totalAmount = batches.reduce(
    (sum, batch) => sum + (batch.quantity ?? 0) * (batch.unitCost ?? 0),
    0,
  );
  const quantity = batches.reduce(
    (sum, batch) => sum + (batch.quantity ?? 0),
    0,
  );

  return {
    ...item,
    totalAmount,
    costPrice: quantity > 0 ? totalAmount / quantity : 0,
  };
};

interface WarehouseProductsTableProps {
  items: ProductStock[];
  loading: boolean;
  warehouseId: number | null;
  /** Show the product group column (the all-products list; a group's own page does not need it). */
  showGroup?: boolean;
  /** Row number offset when the list is paged. */
  indexOffset?: number;
  scrollY?: string;
  /** Marks this search in the product name and MXIK. */
  highlight?: string;
  /** Nested under a group row: small rows, no own scroll area. */
  compact?: boolean;
}

/** Products in stock with their quantity and cost; the menu button opens the markings. */
export default function WarehouseProductsTable({
  items,
  loading,
  warehouseId,
  showGroup = false,
  indexOffset = 0,
  scrollY = "calc(100vh - 300px)",
  highlight,
  compact = false,
}: WarehouseProductsTableProps) {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<ProductStock | null>(
    null,
  );

  const serialProductId =
    selectedProduct?.productId ?? selectedProduct?.id ?? null;
  const {
    data: serialData,
    isLoading: isSerialLoading,
    isFetching: isSerialFetching,
  } = useGetDetailSerialWarehouse(
    serialProductId
      ? { productId: serialProductId, page: 1, pageSize: 1000, warehouseId }
      : undefined,
  );

  const rows = useMemo(
    () =>
      items.map((item, index) => ({
        ...withBatchCost(item),
        indexId: indexOffset + index + 1,
      })),
    [items, indexOffset],
  );
  const totalAmount = rows.reduce(
    (sum, item) => sum + (item.totalAmount ?? 0),
    0,
  );

  const columns: TableColumnsType<ProductStock & { indexId: number }> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "actions",
      title: "CH",
      align: "center",
      render: (_, record) => (
        <Button
          shape="circle"
          size={compact ? "small" : "middle"}
          icon={<Menu className="size-4" />}
          onClick={() => setSelectedProduct(record)}
        />
      ),
    },
    {
      dataIndex: "name",
      title: t("warehouse.fields.productName"),
      render: (_, record) => (
        <SearchHighlight text={getProductName(record)} search={highlight} />
      ),
    },
    ...(showGroup
      ? [
          {
            dataIndex: "productGroupName",
            title: t("warehouse.fields.productType"),
            render: (value?: string) => value || "-",
          },
        ]
      : []),
    {
      dataIndex: "productMxik",
      title: t("warehouse.fields.mxik"),
      align: "center",
      render: (_, record) => (
        <SearchHighlight
          text={record.productMxik || record.mxik}
          search={highlight}
          empty="-"
        />
      ),
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
      title: t("warehouse.fields.costPrice"),
      align: "right",
      render: (value?: number) => numberSpacing(value ?? 0, undefined, true),
    },
    {
      dataIndex: "totalAmount",
      title: t("warehouse.fields.totalPrice"),
      align: "right",
      render: (value?: number) => numberSpacing(value ?? 0, undefined, true),
    },
  ];

  return (
    <>
      <Table<ProductStock & { indexId: number }>
        loading={loading}
        columns={columns}
        dataSource={generateKeyTable(rows)}
        pagination={false}
        size={compact ? "small" : "middle"}
        className={compact ? "my-1" : undefined}
        scroll={compact ? { x: "max-content" } : { x: "max-content", y: scrollY }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={columns.length - 1}>
                <span className="font-semibold text-text">
                  {t("common.total")}
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={columns.length - 1} align="right">
                <span className="font-semibold text-text">
                  {numberSpacing(totalAmount, undefined, true)}
                </span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
      <ProductStockSerialModal
        open={Boolean(selectedProduct)}
        title={getProductName(selectedProduct)}
        items={serialData?.items ?? []}
        loading={isSerialLoading || isSerialFetching}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
