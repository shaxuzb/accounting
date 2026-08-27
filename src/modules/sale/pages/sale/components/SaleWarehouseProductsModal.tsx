import { Button, Checkbox, Input, Modal, Select, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import InputNumberFormat from "@/components/fields/InputNumber";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { formatDate, numberSpacing } from "@/utils/utils";
import type { SaleProductPriceLayer, SaleProductStock } from "../types/type";
import { roundMoney } from "../utils/pricing";
import { normalizeProductPriceDetails } from "../utils/salePricingDetails";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  products: SaleProductStock[];
  loading: boolean;
  disabled?: boolean;
  aggregateStockMode?: boolean;
  vatPercent?: number;
  search: string;
  loadingProductId?: number | null;
  onSearch: (value: string) => void;
  onClose: () => void;
  onAdd: (
    product: SaleProductStock,
    layers: SaleProductPriceLayer[],
    salePrice: number,
    quantity?: number,
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

const getDefaultTotalSale = (
  product: SaleProductStock,
  layers: SaleProductPriceLayer[],
  quantity: number,
  vatPercent: number,
) =>
  roundMoney(
    quantity * getDefaultSalePrice(product, layers) * (1 + vatPercent / 100),
  );

const getSalePriceFromTotal = (
  totalSale: number,
  quantity: number,
  vatPercent: number,
) =>
  quantity > 0
    ? roundMoney(totalSale / quantity / (1 + vatPercent / 100))
    : 0;

interface BatchRow extends SaleProductPriceLayer {
  rowKey: string;
}

export default function SaleWarehouseProductsModal({
  open,
  products,
  loading,
  disabled = false,
  aggregateStockMode = false,
  vatPercent = 0,
  search,
  loadingProductId,
  onSearch,
  onClose,
  onAdd,
}: Props) {
  const { t } = useTranslation();
  const [quantities, setQuantities] = useState<Record<string, number | null>>(
    {},
  );
  const [productQuantities, setProductQuantities] = useState<
    Record<number, number | null>
  >({});
  const [saleTotals, setSaleTotals] = useState<Record<number, number | null>>(
    {},
  );
  const [groupFilter, setGroupFilter] = useState<string>();
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchValue, setSearchValue] = useState(search);
  const debouncedSearch = useDebounce(searchValue.trim(), 300);

  useEffect(() => {
    if (debouncedSearch !== search) onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch, search]);

  const groupOptions = useMemo(() => {
    const groups = new Map<string, string>();
    products.forEach((product) => {
      const key = String(product.productGroupId ?? product.productGroupName ?? "");
      const label = product.productGroupName || t("sale.fields.ungrouped");
      if (key) groups.set(key, label);
    });
    return Array.from(groups, ([value, label]) => ({ value, label }));
  }, [products, t]);

  const visibleProducts = useMemo(
    () => {
      const query = searchValue.trim().toLowerCase();

      return products.filter((product) => {
        const productGroupKey = String(
          product.productGroupId ?? product.productGroupName ?? "",
        );
        const searchableText = [
          product.productName,
          product.name,
          product.productMxik,
          product.mxik,
          product.barcode,
          product.sapCode,
          product.productId,
        ]
          .filter((value) => value !== null && value !== undefined)
          .join(" ")
          .toLowerCase();

        return (
          (!query || searchableText.includes(query)) &&
          (!groupFilter || productGroupKey === groupFilter) &&
          (!onlyAvailable || getAvailableQuantity(product) > 0)
        );
      });
    },
    [groupFilter, onlyAvailable, products, searchValue],
  );

  const layersByProductId = useMemo(() => {
    const result = new Map<number, SaleProductPriceLayer[]>();

    if (!open) return result;

    visibleProducts.forEach((product) => {
      const details = normalizeProductPriceDetails(product, product);
      result.set(getStockProductId(product), details.layers);
    });

    return result;
  }, [open, visibleProducts]);

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
    if (aggregateStockMode) {
      return visibleProducts.reduce(
        (summary, product) => {
          const productId = getStockProductId(product);
          const quantity = Math.min(
            Number(productQuantities[productId] ?? 0),
            getAvailableQuantity(product),
          );
          if (quantity <= 0) return summary;

          const layers = layersByProductId.get(productId) ?? [];
          const totalSale =
            saleTotals[productId] ??
            getDefaultTotalSale(product, layers, quantity, vatPercent);
          const costPrice = Number(product.costPrice ?? product.price ?? 0);

          return {
            products: summary.products + 1,
            quantity: summary.quantity + quantity,
            totalCost: summary.totalCost + quantity * costPrice,
            totalSale: summary.totalSale + totalSale,
          };
        },
        { products: 0, quantity: 0, totalCost: 0, totalSale: 0 },
      );
    }

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
        const selectedQuantity = selectedLayers.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        const totalSale =
          saleTotals[productId] ??
          getDefaultTotalSale(product, layers, selectedQuantity, vatPercent);

        return selectedSummaryForProduct(summary, selectedLayers, totalSale);
      },
      { products: 0, quantity: 0, totalCost: 0, totalSale: 0 },
    );
  }, [
    aggregateStockMode,
    layersByProductId,
    productQuantities,
    quantities,
    saleTotals,
    vatPercent,
    visibleProducts,
  ]);

  const handleQuantityChange = (
    productId: number,
    layer: SaleProductPriceLayer,
    value: number | null,
  ) => {
    const key = getLayerKey(productId, layer);
    const quantity = value === null ? null : Math.min(value, layer.availableQuantity);
    setQuantities((current) => ({ ...current, [key]: quantity }));
  };

  const handleProductQuantityChange = (
    productId: number,
    value: number | null,
    availableQuantity: number,
  ) => {
    const quantity =
      value === null ? null : Math.min(Math.max(value, 0), availableQuantity);
    setProductQuantities((current) => ({ ...current, [productId]: quantity }));
  };

  const handleAddSelected = async () => {
    if (aggregateStockMode) {
      const selected = visibleProducts
        .map((product) => {
          const productId = getStockProductId(product);
          const quantity = Math.min(
            Number(productQuantities[productId] ?? 0),
            getAvailableQuantity(product),
          );
          if (quantity <= 0) return null;

          const layers = layersByProductId.get(productId) ?? [];
          const totalSale =
            saleTotals[productId] ??
            getDefaultTotalSale(product, layers, quantity, vatPercent);
          const salePrice = getSalePriceFromTotal(
            totalSale,
            quantity,
            vatPercent,
          );
          return { product, salePrice, quantity };
        })
        .filter(
          (
            item,
          ): item is {
            product: SaleProductStock;
            salePrice: number;
            quantity: number;
          } => Boolean(item),
        );

      if (!selected.length) return;

      setIsAdding(true);
      try {
        await Promise.all(
          selected.map(({ product, salePrice, quantity }) =>
            onAdd(product, [], salePrice, quantity),
          ),
        );
        onClose();
      } finally {
        setIsAdding(false);
      }
      return;
    }

    const selected = visibleProducts
      .map((product) => {
        const productId = getStockProductId(product);
        const layers = getSelectedLayers(product);
        if (!layers.length) return null;

        const quantity = layers.reduce(
          (sum, layer) => sum + layer.writeOffQuantity,
          0,
        );
        const totalSale =
          saleTotals[productId] ??
          getDefaultTotalSale(product, layers, quantity, vatPercent);
        const salePrice = getSalePriceFromTotal(
          totalSale,
          quantity,
          vatPercent,
        );
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
      title: t("sale.fields.batchNumber"),
      render: (value, record) => value || record.batchId || "-",
    },
    {
      dataIndex: "purchaseDate",
      title: t("sale.fields.receiptDate"),
      render: (value) => formatDate(value) || "-",
    },
    {
      dataIndex: "availableQuantity",
      title: t("sale.fields.available"),
      align: "center",
      render: (value) => numberSpacing(value, undefined, true),
    },
    {
      dataIndex: "unitPrice",
      title: t("warehouse.fields.costPrice"),
      align: "center",
      render: (value) => numberSpacing(value, undefined, true),
    },
    {
      dataIndex: "writeOffQuantity",
      title: t("sale.fields.quantityToSell"),
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
            placeholder={t("openingInventory.fields.quantity")}
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
      title: t("purchase.fields.product"),
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
      title: t("warehouse.lines.stock"),
      align: "center",
      render: (_, product) =>
        numberSpacing(getAvailableQuantity(product), undefined, true),
    },
    {
      dataIndex: "salePrice",
      title: t("sale.fields.totalWithVat"),
      width: 170,
      render: (_, product) => {
        const productId = getStockProductId(product);
        const layers = layersByProductId.get(productId) ?? [];
        const quantity = Math.min(
          Number(productQuantities[productId] ?? 0),
          getAvailableQuantity(product),
        );
        const hasManualTotal = Object.prototype.hasOwnProperty.call(
          saleTotals,
          productId,
        );
        return (
          <InputNumberFormat
            standalone
            emptyZero
            min={0}
            precision={2}
            value={
              hasManualTotal
                ? saleTotals[productId]
                : getDefaultTotalSale(product, layers, quantity, vatPercent)
            }
            disabled={disabled}
            onValueChange={(value) =>
              setSaleTotals((current) => ({ ...current, [productId]: value }))
            }
          />
        );
      },
    },
    {
      dataIndex: "unitName",
      title: t("purchase.fields.unit"),
      align: "center",
      render: (value) => value || t("sale.fields.piece"),
    },
    {
      dataIndex: "selected",
      title: t("sale.fields.selected"),
      align: "center",
      render: (_, product) => {
        if (aggregateStockMode) {
          const productId = getStockProductId(product);
          return (
            <InputNumberFormat
              standalone
              emptyZero
              min={0}
              max={getAvailableQuantity(product)}
              precision={3}
              value={productQuantities[productId] ?? null}
              disabled={disabled || !getAvailableQuantity(product)}
              placeholder={t("openingInventory.fields.quantity")}
              onValueChange={(value) =>
                handleProductQuantityChange(
                  productId,
                  value,
                  getAvailableQuantity(product),
                )
              }
            />
          );
        }

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
    <Modal maskClosable={false}
      open={open}
      title={t("menu.warehouse")}
      footer={null}
      width={1500}
      destroyOnHidden
      onCancel={onClose}
    >
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Input
          className="min-w-64 max-w-80"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder={t("sale.warehouse.searchProduct")}
          prefix={<Search className="size-4 text-secondary-text" />}
          allowClear
        />
        <Select
          allowClear
          className="min-w-52"
          value={groupFilter}
          options={groupOptions}
          placeholder={t("sale.warehouse.allGroups")}
          onChange={setGroupFilter}
        />
        <Checkbox
          checked={onlyAvailable}
          onChange={(event) => setOnlyAvailable(event.target.checked)}
        >
          {t("sale.warehouse.availableOnly")}
        </Checkbox>
      </div>
      <Table<SaleProductStock>
        loading={loading || isAdding || loadingProductId != null}
        columns={productColumns}
        dataSource={visibleProducts}
        rowKey={(product) => getStockProductId(product)}
        pagination={{
          defaultPageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: [25, 50, 100],
          showTotal: (total, range) =>
            t("common.resultRange", {
              from: range[0],
              to: range[1],
              total,
            }),
        }}
        scroll={{ x: "max-content", y: 560 }}
        expandable={aggregateStockMode ? undefined : {
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
                <div className="mb-2 font-semibold">
                  {t("sale.warehouse.productBatches")}
                </div>
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
        locale={{ emptyText: t("sale.messages.warehouseStockEmpty") }}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex flex-wrap gap-5 text-sm">
          <span>
            {t("sale.warehouse.selectedProduct")}: <b>{selectedSummary.products}</b>
          </span>
          <span>
            {t("openingInventory.fields.quantity")}: <b>{numberSpacing(selectedSummary.quantity, undefined, true)}</b>
          </span>
          <span>
            {t("sale.warehouse.totalCost")}: <b>{numberSpacing(selectedSummary.totalCost, undefined, true)}</b>
          </span>
          <span>
            {t("sale.warehouse.totalSale")}: <b>{numberSpacing(selectedSummary.totalSale, undefined, true)}</b>
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button
            type="primary"
            loading={isAdding}
            disabled={disabled || !selectedSummary.quantity}
            onClick={() => void handleAddSelected()}
          >
            {t("sale.actions.addSelected")}
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
  totalSale: number,
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
    totalSale: summary.totalSale + totalSale,
  };
}
