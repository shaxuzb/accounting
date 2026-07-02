import { Button, Input, Modal, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import InputNumberFormat from "@/components/fields/InputNumber";
import { formatDate, numberSpacing } from "@/utils/utils";
import { useGetProductPriceDetails } from "../hooks";
import type {
  SaleProductPriceLayer,
  SaleProductStock,
} from "../types/type";
import { normalizeProductPriceDetails } from "../utils/salePricingDetails";

interface Props {
  open: boolean;
  products: SaleProductStock[];
  loading: boolean;
  disabled?: boolean;
  search: string;
  loadingProductId?: number | null;
  onSearch: (value: string) => void;
  onClose: () => void;
  onAdd: (
    product: SaleProductStock,
    layer: SaleProductPriceLayer,
    quantity: number,
  ) => void | Promise<void>;
}

interface WarehouseLayerRow {
  rowKey: string;
  product: SaleProductStock;
  layer: SaleProductPriceLayer;
}

const getStockProductId = (product: SaleProductStock) =>
  product.productId || product.id;

const getProductName = (product: SaleProductStock) =>
  product.productName || product.name || "-";

const getAvailableQuantity = (product: SaleProductStock) =>
  Number(product.quantity || 0);

const getLayerKey = (productId: number, layer: SaleProductPriceLayer) =>
  [
    productId,
    layer.purchaseId ?? "purchase",
    layer.productTableId ?? "table",
    layer.purchaseDate ?? "date",
  ].join(":");

export default function SaleWarehouseProductsModal({
  open,
  products,
  loading,
  disabled = false,
  search,
  loadingProductId,
  onSearch,
  onClose,
  onAdd,
}: Props) {
  const [layersByProductId, setLayersByProductId] = useState<
    Record<number, SaleProductPriceLayer[]>
  >({});
  const [loadingDetailIds, setLoadingDetailIds] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number | null>>(
    {},
  );
  const getProductPriceDetails = useGetProductPriceDetails();
  const visibleProducts = useMemo(
    () => products.filter((item) => getAvailableQuantity(item) > 0),
    [products],
  );

  useEffect(() => {
    if (!open || !visibleProducts.length) return;

    const unloadedProducts = visibleProducts.filter((product) => {
      const productId = getStockProductId(product);
      return !layersByProductId[productId] && !loadingDetailIds.includes(productId);
    });

    unloadedProducts.forEach((product) => {
      const productId = getStockProductId(product);
      setLoadingDetailIds((current) => [...current, productId]);
      getProductPriceDetails
        .mutateAsync(productId)
        .then((response) => {
          const detail = normalizeProductPriceDetails(response, product);
          setLayersByProductId((current) => ({
            ...current,
            [productId]: detail.layers,
          }));
        })
        .finally(() => {
          setLoadingDetailIds((current) =>
            current.filter((id) => id !== productId),
          );
        });
    });
  }, [
    getProductPriceDetails,
    layersByProductId,
    loadingDetailIds,
    open,
    visibleProducts,
  ]);

  const rows = useMemo<WarehouseLayerRow[]>(
    () =>
      visibleProducts.flatMap((product) => {
        const productId = getStockProductId(product);
        const layers = layersByProductId[productId] ?? [];
        return layers
          .filter((layer) => layer.availableQuantity > 0)
          .map((layer) => ({
            product,
            layer,
            rowKey: getLayerKey(productId, layer),
          }));
      }),
    [layersByProductId, visibleProducts],
  );

  const addLayer = async (row: WarehouseLayerRow) => {
    const quantity = Number(quantities[row.rowKey] ?? 0);
    if (!quantity || quantity <= 0) return;

    await onAdd(
      row.product,
      row.layer,
      Math.min(quantity, row.layer.availableQuantity),
    );
    setQuantities((current) => ({ ...current, [row.rowKey]: null }));
  };

  const columns: TableColumnsType<WarehouseLayerRow> = [
    {
      dataIndex: "indexId",
      title: "T/r",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      dataIndex: "productName",
      title: "Mahsulot",
      render: (_, record) => getProductName(record.product),
    },
    {
      dataIndex: "purchaseDocNumber",
      title: "Kirim hujjati",
      render: (_, record) => record.layer.purchaseDocNumber || "-",
    },
    {
      dataIndex: "purchaseDate",
      title: "Kirim sanasi",
      render: (_, record) => formatDate(record.layer.purchaseDate) || "-",
    },
    // {
    //   dataIndex: "mxik",
    //   title: "MXIK kod",
    //   width: 150,
    //   render: (_, record) =>
    //     record.product.mxik || record.product.barcode || record.product.sapCode || "-",
    // },
    {
      dataIndex: "availableQuantity",
      title: "Qoldiq",
      align: "center",
      render: (_, record) =>
        numberSpacing(record.layer.availableQuantity, undefined, true),
    },
    { 
      dataIndex: "unitName",
      title: "Birlik",
      render: (_, record) => record.product.unitName || "Dona",
    },
    {
      dataIndex: "unitPrice",
      title: "Tannarx",
      align: "center",
      render: (_, record) => numberSpacing(record.layer.unitPrice, undefined, true),
    },
    {
      dataIndex: "salePrice",
      title: "Sotuv narxi",
      align: "center",
      render: (_, record) => numberSpacing(record.layer.salePrice, undefined, true),
    },
    {
      dataIndex: "quantity",
      title: "Miqdor",
      width: 130,
      render: (_, record) => (
        <InputNumberFormat
          standalone
          emptyZero
          min={0}
          max={record.layer.availableQuantity}
          precision={3}
          value={quantities[record.rowKey] ?? null}
          placeholder="Miqdor"
          disabled={disabled || !record.layer.availableQuantity}
          onValueChange={(value) =>
            setQuantities((current) => ({ ...current, [record.rowKey]: value }))
          }
          onPressEnter={() => void addLayer(record)}
        />
      ),
    },
    {
      dataIndex: "actions",
      // title: "Amallar",
      align: "center",
      render: (_, record) => {
        const productId = getStockProductId(record.product);
        const quantity = Number(quantities[record.rowKey] ?? 0);
        return (
          <Button
            type="text"
            icon={<Plus className="size-4" />}
            loading={loadingProductId === productId}
            disabled={disabled || !quantity || !record.layer.availableQuantity}
            onClick={() => void addLayer(record)}
          />
        );
      },
    },
  ];

  return (
    <Modal
      open={open}
      title="Omborxona"
      footer={null}
      width={1500}
      destroyOnHidden
      onCancel={onClose}
    >
      <div className="mb-3 flex justify-end">
        <Input
          className="max-w-80"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Mahsulot qidirish..."
          prefix={<Search className="size-4 text-secondary-text" />}
          allowClear
        />
      </div>
      <Table<WarehouseLayerRow>
        loading={loading || loadingDetailIds.length > 0}
        columns={columns}
        dataSource={rows}
        rowKey="rowKey"
        pagination={false}
        scroll={{ x: "max-content", y: 560 }}
        locale={{ emptyText: "Omborxonada hujjat bo'yicha qoldiq topilmadi" }}
      />
    </Modal>
  );
}
