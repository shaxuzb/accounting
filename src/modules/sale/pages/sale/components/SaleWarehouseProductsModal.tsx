import { Button, Checkbox, Input, Modal, Select, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import InputNumberFormat from "@/components/fields/InputNumber";
import { formatDate, numberSpacing } from "@/utils/utils";
import type { SaleProductPriceLayer, SaleProductStock } from "../types/type";
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
    layers: SaleProductPriceLayer[],
    salePrice: number,
  ) => void | Promise<void>;
}

const getStockProductId = (product: SaleProductStock) =>
  product.productId || product.id || 0;

const getProductName = (product: SaleProductStock) =>
  product.productName || product.name || "-";

const getAvailableQuantity = (product: SaleProductStock) =>
  Number(product.availableQuantity ?? product.quantity ?? 0);

const getLayerKey = (productId: number, layer: SaleProductPriceLayer) =>
  `${productId}:${layer.batchId ?? layer.purchaseId ?? layer.id ?? layer.purchaseDate ?? "layer"}`;

const getDefaultSalePrice = (
  product: SaleProductStock,
  layers: SaleProductPriceLayer[],
) =>
  Number(
    product.salePrice ??
      product.price ??
      product.costPrice ??
      layers[0]?.unitPrice ??
      0,
  );

interface BatchRow extends SaleProductPriceLayer {
  rowKey: string;
}

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
  const [quantities, setQuantities] = useState<Record<string, number | null>>(
    {},
  );
  const [salePrices, setSalePrices] = useState<Record<number, number | null>>(
    {},
  );
  const [groupFilter, setGroupFilter] = useState<string>();
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const groupOptions = useMemo(() => {
    const groups = new Map<string, string>();
    products.forEach((product) => {
      const key = String(product.productGroupId ?? product.productGroupName ?? "");
      const label = product.productGroupName || "Guruhsiz";
      if (key) groups.set(key, label);
    });
    return Array.from(groups, ([value, label]) => ({ value, label }));
  }, [products]);

  const visibleProducts = useMemo(
    () =>
      products.filter((product) => {
        const productGroupKey = String(
          product.productGroupId ?? product.productGroupName ?? "",
        );
        return (
          (!groupFilter || productGroupKey === groupFilter) &&
          (!onlyAvailable || getAvailableQuantity(product) > 0)
        );
      }),
    [groupFilter, onlyAvailable, products],
  );

  const layersByProductId = useMemo(() => {
    const result = new Map<number, SaleProductPriceLayer[]>();

    visibleProducts.forEach((product) => {
      const details = normalizeProductPriceDetails(product, product);
      result.set(getStockProductId(product), details.layers);
    });

    return result;
  }, [visibleProducts]);

  const getSelectedLayers = (product: SaleProductStock) => {
    const productId = getStockProductId(product);
    const layers = layersByProductId.get(productId) ?? [];

    return layers
      .map((layer) => ({
        ...layer,
        writeOffQuantity: Math.min(
          Number(quantities[getLayerKey(productId, layer)] ?? 0),
          layer.availableQuantity,
        ),
      }))
      .filter((layer) => layer.writeOffQuantity > 0);
  };

  const selectedSummary = useMemo(() => {
    return visibleProducts.reduce(
      (summary, product) => {
        const productId = getStockProductId(product);
        const layers = layersByProductId.get(productId) ?? [];
        const selectedLayers = layers
          .map((layer) => ({
            layer,
            quantity: Math.min(
              Number(quantities[getLayerKey(productId, layer)] ?? 0),
              layer.availableQuantity,
            ),
          }))
          .filter((item) => item.quantity > 0);
        const salePrice =
          salePrices[productId] ?? getDefaultSalePrice(product, layers);

        return selectedSummaryForProduct(summary, selectedLayers, salePrice);
      },
      { products: 0, quantity: 0, totalCost: 0, totalSale: 0 },
    );
  }, [layersByProductId, quantities, salePrices, visibleProducts]);

  const handleQuantityChange = (
    productId: number,
    layer: SaleProductPriceLayer,
    value: number | null,
  ) => {
    const key = getLayerKey(productId, layer);
    const quantity = value === null ? null : Math.min(value, layer.availableQuantity);
    setQuantities((current) => ({ ...current, [key]: quantity }));
  };

  const handleAddSelected = async () => {
    const selected = visibleProducts
      .map((product) => {
        const productId = getStockProductId(product);
        const layers = getSelectedLayers(product);
        if (!layers.length) return null;

        const salePrice =
          salePrices[productId] ?? getDefaultSalePrice(product, layers);
        return { product, layers, salePrice };
      })
      .filter(
        (
          item,
        ): item is {
          product: SaleProductStock;
          layers: SaleProductPriceLayer[];
          salePrice: number;
        } => Boolean(item),
      );

    if (!selected.length) return;

    setIsAdding(true);
    try {
      await Promise.all(
        selected.map(({ product, layers, salePrice }) =>
          onAdd(product, layers, salePrice),
        ),
      );
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

  const batchColumns: TableColumnsType<BatchRow> = [
    {
      dataIndex: "batchNumber",
      title: "Partiya raqami",
      render: (value, record) => value || record.batchId || "-",
    },
    {
      dataIndex: "purchaseDate",
      title: "Kirim sanasi",
      render: (value) => formatDate(value) || "-",
    },
    {
      dataIndex: "availableQuantity",
      title: "Mavjud",
      align: "center",
      render: (value) => numberSpacing(value, undefined, true),
    },
    {
      dataIndex: "unitPrice",
      title: "Tannarx",
      align: "center",
      render: (value) => numberSpacing(value, undefined, true),
    },
    {
      dataIndex: "writeOffQuantity",
      title: "Sotiladigan miqdor",
      width: 170,
      render: (_, record) => {
        const productId = Number(record.rowKey.split(":")[0]);
        const quantityKey = getLayerKey(productId, record);
        return (
          <InputNumberFormat
            standalone
            emptyZero
            min={0}
            max={record.availableQuantity}
            precision={3}
            value={quantities[quantityKey] ?? null}
            disabled={disabled || !record.availableQuantity}
            placeholder="Miqdor"
            onValueChange={(value) =>
              handleQuantityChange(productId, record, value)
            }
          />
        );
      },
    },
  ];

  const productColumns: TableColumnsType<SaleProductStock> = [
    {
      dataIndex: "productName",
      title: "Mahsulot",
      minWidth: 320,
      render: (_, product) => (
        <div className="min-w-0">
          <div className="font-medium">{getProductName(product)}</div>
          <div className="text-xs text-muted-second">
            {product.productGroupName || "-"}
            {product.productMxik || product.mxik
              ? ` · MXIK: ${product.productMxik || product.mxik}`
              : ""}
          </div>
        </div>
      ),
    },
    {
      dataIndex: "availableQuantity",
      title: "Qoldiq",
      align: "center",
      render: (_, product) =>
        numberSpacing(getAvailableQuantity(product), undefined, true),
    },
    {
      dataIndex: "salePrice",
      title: "Sotuv narxi",
      width: 170,
      render: (_, product) => {
        const productId = getStockProductId(product);
        const layers = layersByProductId.get(productId) ?? [];
        return (
          <InputNumberFormat
            standalone
            emptyZero
            min={0}
            precision={2}
            value={salePrices[productId] ?? getDefaultSalePrice(product, layers)}
            disabled={disabled}
            onValueChange={(value) =>
              setSalePrices((current) => ({ ...current, [productId]: value }))
            }
          />
        );
      },
    },
    {
      dataIndex: "unitName",
      title: "Birlik",
      align: "center",
      render: (value) => value || "Dona",
    },
    {
      dataIndex: "selected",
      title: "Tanlangan",
      align: "center",
      render: (_, product) => {
        const selectedLayers = getSelectedLayers(product);
        return numberSpacing(
          selectedLayers.reduce((sum, layer) => sum + layer.writeOffQuantity, 0),
          undefined,
          true,
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
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Input
          className="min-w-64 max-w-80"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Mahsulot qidirish..."
          prefix={<Search className="size-4 text-secondary-text" />}
          allowClear
        />
        <Select
          allowClear
          className="min-w-52"
          value={groupFilter}
          options={groupOptions}
          placeholder="Barcha guruhlar"
          onChange={setGroupFilter}
        />
        <Checkbox
          checked={onlyAvailable}
          onChange={(event) => setOnlyAvailable(event.target.checked)}
        >
          Faqat mavjud
        </Checkbox>
      </div>
      <Table<SaleProductStock>
        loading={loading || isAdding || loadingProductId != null}
        columns={productColumns}
        dataSource={visibleProducts}
        rowKey={(product) => getStockProductId(product)}
        pagination={false}
        scroll={{ x: "max-content", y: 560 }}
        expandable={{
          defaultExpandAllRows: false,
          rowExpandable: (product) =>
            Boolean(layersByProductId.get(getStockProductId(product))?.length),
          expandedRowRender: (product) => {
            const productId = getStockProductId(product);
            const rows = (layersByProductId.get(productId) ?? []).map(
              (layer) => ({
                ...layer,
                rowKey: getLayerKey(productId, layer),
              }),
            );

            return (
              <div className="rounded-lg border border-border bg-primary-bg p-3">
                <div className="mb-2 font-semibold">Mahsulot partiyalari</div>
                <Table<BatchRow>
                  size="small"
                  columns={batchColumns}
                  dataSource={rows}
                  rowKey="rowKey"
                  pagination={false}
                  scroll={{ x: "max-content" }}
                />
              </div>
            );
          },
        }}
        locale={{ emptyText: "Omborxonada qoldiq topilmadi" }}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex flex-wrap gap-5 text-sm">
          <span>
            Tanlangan mahsulot: <b>{selectedSummary.products}</b>
          </span>
          <span>
            Miqdor: <b>{numberSpacing(selectedSummary.quantity, undefined, true)}</b>
          </span>
          <span>
            Jami tannarx: <b>{numberSpacing(selectedSummary.totalCost, undefined, true)}</b>
          </span>
          <span>
            Jami sotuv: <b>{numberSpacing(selectedSummary.totalSale, undefined, true)}</b>
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={onClose}>Bekor qilish</Button>
          <Button
            type="primary"
            loading={isAdding}
            disabled={disabled || !selectedSummary.quantity}
            onClick={() => void handleAddSelected()}
          >
            Tanlanganlarni qo‘shish
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function selectedSummaryForProduct(
  summary: {
    products: number;
    quantity: number;
    totalCost: number;
    totalSale: number;
  },
  selectedLayers: { layer: SaleProductPriceLayer; quantity: number }[],
  salePrice: number,
) {
  if (!selectedLayers.length) return summary;

  return {
    products: summary.products + 1,
    quantity:
      summary.quantity +
      selectedLayers.reduce((sum, item) => sum + item.quantity, 0),
    totalCost:
      summary.totalCost +
      selectedLayers.reduce(
        (sum, item) => sum + item.quantity * item.layer.unitPrice,
        0,
      ),
    totalSale:
      summary.totalSale +
      selectedLayers.reduce((sum, item) => sum + item.quantity * salePrice, 0),
  };
}
