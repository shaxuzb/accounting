import { Button, Input, Select, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import InputNumberFormat from "@/components/fields/InputNumber";
import Card from "@/components/ui/card/Card";
import { selectListEndpoints, selectListKeys } from "@/shared/constants/selectLists";
import { $axiosPrivate } from "@/services/AxiosService";
import type { SaleCondition } from "@/modules/settings/pages/saleCondition/types/type";
import { generateKeyTable, numberSpacing } from "@/utils/utils";
import { useGetProductPriceDetails, useGetSaleProductStocks } from "../hooks";
import type {
  SaleProductPriceLayer,
  SaleProductStock,
  SaleSelectedProduct,
} from "../types/type";
import {
  COSTING_METHOD,
  allocateSaleLayers,
  getCostingPrices,
  getMarkupPercent,
  getSalePriceByMarkup,
  normalizeProductPriceDetails,
} from "../utils/salePricingDetails";
import SaleWarehouseProductsModal from "./SaleWarehouseProductsModal";

interface Props {
  comment: string;
  products: SaleSelectedProduct[];
  saleCondition: SaleCondition;
  onCommentChange: (value: string) => void;
  onChange: (products: SaleSelectedProduct[]) => void;
  disabled?: boolean;
}

interface VatRateOption {
  id: number;
  name: string;
}

const newRowKey = "__new__";
const isNewRow = (rowKey?: string) => Boolean(rowKey?.startsWith(newRowKey));

const getStockProductId = (product: SaleProductStock) =>
  product.productId || product.id;

const getProductName = (product?: SaleProductStock | null) =>
  product?.productName || product?.name || "-";

const getVatPercent = (vatRateId: number | null | undefined, options: VatRateOption[]) => {
  const option = options.find((item) => item.id === Number(vatRateId));
  const match = String(option?.name ?? "").match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : 0;
};

const getVatAmount = (
  amount: number,
  vatRateId: number | null | undefined,
  options: VatRateOption[],
) => {
  const percent = getVatPercent(vatRateId, options);
  return percent ? (amount * percent) / (100 + percent) : 0;
};

const getLineAmount = (line: SaleSelectedProduct) =>
  line.quantity * line.unitPrice;

const getLineTotal = (line: SaleSelectedProduct, vatRates: VatRateOption[]) =>
  getLineAmount(line) + getVatAmount(getLineAmount(line), line.vatRateId, vatRates);

const getLayerSaleAmount = (layer: SaleProductPriceLayer) =>
  layer.writeOffQuantity * layer.salePrice;

const getLayerTotal = (
  layer: SaleProductPriceLayer,
  vatRateId: number | null | undefined,
  vatRates: VatRateOption[],
) => {
  const amount = getLayerSaleAmount(layer);
  return amount + getVatAmount(amount, vatRateId, vatRates);
};

const getAvailableQuantity = (product: SaleProductStock, fallback = 0) =>
  Number(product.quantity || fallback || 0);

const recalculateLine = ({
  line,
  quantity = line.quantity,
  markupPercent = line.markupPercent ?? 0,
  unitPrice,
  costingMethodId,
  keepManualPrice = true,
}: {
  line: SaleSelectedProduct;
  quantity?: number;
  markupPercent?: number;
  unitPrice?: number;
  costingMethodId: number;
  keepManualPrice?: boolean;
}): SaleSelectedProduct => {
  const allocatedLayers =
    costingMethodId === COSTING_METHOD.AVERAGE
      ? []
      : allocateSaleLayers({
          costingMethodId,
          quantity,
          layers: line.priceLayers ?? [],
        });
  const prices = getCostingPrices({
    costingMethodId,
    defaultCostPrice: line.costPrice,
    defaultSalePrice: line.unitPrice,
    layers: allocatedLayers,
  });
  const nextCostPrice = prices.costPrice || line.costPrice;
  const shouldKeepManualPrice = keepManualPrice && line.priceType === "manual";
  const nextUnitPrice =
    unitPrice ??
    (shouldKeepManualPrice
      ? line.unitPrice
      : prices.unitPrice ||
        getSalePriceByMarkup(nextCostPrice, markupPercent));

  return {
    ...line,
    quantity,
    costPrice: nextCostPrice,
    unitPrice: nextUnitPrice,
    markupPercent,
    layers: allocatedLayers.map((layer) => ({
      ...layer,
      salePrice: shouldKeepManualPrice ? nextUnitPrice : layer.salePrice,
    })),
  };
};

export default function SaleProductSelection({
  comment,
  products,
  saleCondition,
  onCommentChange,
  onChange,
  disabled = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [emptyRowKeys, setEmptyRowKeys] = useState<string[]>([newRowKey]);
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);
  const getProductPriceDetails = useGetProductPriceDetails();
  const params = useMemo(() => {
    const value = new URLSearchParams();
    value.set("Page", "1");
    value.set("PageSize", "1000");
    if (search.trim()) value.set("Search", search.trim());
    return value;
  }, [search]);
  const { data, isLoading, isFetching } = useGetSaleProductStocks(params);
  const { data: vatRateOptions = [] } = useQuery<VatRateOption[]>({
    queryKey: ["selectlist", selectListKeys.vatRate],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<VatRateOption[]>(
        selectListEndpoints.vatRatesSelectList,
      );
      return data ?? [];
    },
  });
  const stockProducts = data?.items ?? [];
  const productOptions = stockProducts.map((item) => ({
    value: getStockProductId(item),
    label: getProductName(item),
    disabled: !getAvailableQuantity(item),
  }));
  const tableRows: SaleSelectedProduct[] = [
    ...products,
    ...emptyRowKeys.map((rowKey) => ({
      rowKey,
      productId: 0,
      productName: "",
      quantity: 0,
      availableQuantity: 0,
      costPrice: 0,
      unitId: 0,
      unitPrice: 0,
      vatRateId: saleCondition.vatRateId,
      markupPercent: 0,
      priceType: "costPlusPercent" as const,
    })),
  ];

  const handleSelectProduct = async (
    productId: number,
    rowKey?: string,
    quantityToAdd?: number,
    sourceLayer?: SaleProductPriceLayer,
  ) => {
    const product = stockProducts.find(
      (item) => getStockProductId(item) === productId,
    );
    if (!product) return;

    setLoadingProductId(productId);
    try {
      const response = await getProductPriceDetails.mutateAsync(productId);
      const detail = normalizeProductPriceDetails(response, product);
      const existingLine =
        rowKey && !isNewRow(rowKey)
          ? products.find((item) => item.rowKey === rowKey)
          : !rowKey && !sourceLayer
            ? products.find((item) => item.productId === productId)
            : undefined;
      const requestedQuantity =
        quantityToAdd === undefined
          ? existingLine?.quantity || 0
          : existingLine && !rowKey
            ? existingLine.quantity + quantityToAdd
            : quantityToAdd;
      const priceLayers = sourceLayer ? [sourceLayer] : detail.layers;
      const quantity = Math.min(
        requestedQuantity,
        sourceLayer?.availableQuantity ||
          detail.availableQuantity ||
          getAvailableQuantity(product),
      );
      const allocatedLayers =
        saleCondition.costingMethodId === COSTING_METHOD.AVERAGE
          ? []
          : allocateSaleLayers({
              costingMethodId: saleCondition.costingMethodId,
              quantity,
              layers: priceLayers,
            });
      const prices = getCostingPrices({
        costingMethodId: saleCondition.costingMethodId,
        defaultCostPrice: sourceLayer?.unitPrice ?? detail.costPrice,
        defaultSalePrice: sourceLayer?.salePrice ?? detail.salePrice,
        layers: allocatedLayers,
      });
      const unitId = detail.unitId || product.unitId || 0;
      if (!unitId) {
        toast.error("Tanlangan mahsulotda birlik topilmadi");
        return;
      }
      const unitPrice = allocatedLayers.length
        ? prices.unitPrice || detail.salePrice || prices.costPrice
        : detail.salePrice || prices.unitPrice || prices.costPrice;
      const nextLine: SaleSelectedProduct = {
        id: existingLine?.id,
        rowKey: existingLine?.rowKey ?? `${productId}-${Date.now()}`,
        productId,
        productName: detail.productName || getProductName(product),
        mxik: detail.mxik || product.mxik || product.barcode,
        quantity,
        availableQuantity:
          sourceLayer?.availableQuantity ||
          detail.availableQuantity ||
          getAvailableQuantity(product),
        costPrice: prices.costPrice || sourceLayer?.unitPrice || detail.costPrice,
        unitId,
        unitName: detail.unitName || product.unitName,
        unitPrice,
        vatRateId: existingLine?.vatRateId ?? saleCondition.vatRateId,
        markupPercent: getMarkupPercent(prices.costPrice, unitPrice),
        priceType: existingLine?.priceType ?? "costPlusPercent",
        isPieceTracked: product.isPieceTracked,
        priceLayers,
        layers: allocatedLayers,
      };

      if (existingLine) {
        onChange(
          products.map((item) =>
            item.rowKey === existingLine.rowKey ? nextLine : item,
          ),
        );
      } else {
        onChange([...products, nextLine]);
        if (isNewRow(rowKey)) {
          setEmptyRowKeys((current) => {
            const rest = current.filter((key) => key !== rowKey);
            return rest.length ? rest : [`${newRowKey}-${Date.now()}`];
          });
        }
      }
    } finally {
      setLoadingProductId(null);
    }
  };

  const updateLine = (
    rowKey: string | undefined,
    updater: (line: SaleSelectedProduct) => SaleSelectedProduct,
  ) => {
    onChange(
      products.map((item) =>
        item.rowKey === rowKey ? updater(item) : item,
      ),
    );
  };

  const removeEmptyRow = (rowKey?: string) => {
    if (!rowKey) return;
    setEmptyRowKeys((current) => {
      const rest = current.filter((key) => key !== rowKey);
      return rest.length ? rest : [`${newRowKey}-${Date.now()}`];
    });
  };

  const columns: TableColumnsType<SaleSelectedProduct> = [
    {
      dataIndex: "indexId",
      title: "T/r",
      width: 44,
      align: "center",
      className: "whitespace-nowrap",
    },
    {
      dataIndex: "productName",
      title: "Mahsulot",
      render: (_, record) => (
        <Select
          showSearch
          className="w-full"
          placeholder="Mahsulot"
          value={record.productId || undefined}
          loading={
            isLoading ||
            isFetching ||
            loadingProductId === record.productId
          }
          optionFilterProp="label"
          options={productOptions}
          disabled={disabled}
          onChange={(value) => handleSelectProduct(Number(value), record.rowKey)}
        />
      ),
    },
    {
      dataIndex: "mxik",
      title: "MXIK kod",
      render: (value) => value || "-",
    },
    // {
    //   dataIndex: "marking",
    //   title: "Markirovka",
    //   align: "center",
    //   render: (_, record) => (
    //     <Tooltip
    //       title={
    //         record.isPieceTracked
    //           ? "Markirovka skladchi bosqichida tanlanadi"
    //           : "Bu mahsulot markirovkasiz"
    //       }
    //     >
    //       <Button
    //         type="text"
    //         disabled={!record.isPieceTracked}
    //         icon={<QrCode className="size-4" />}
    //       />
    //     </Tooltip>
    //   ),
    // },
    {
      dataIndex: "unitName",
      title: "Birlik",
      render: (value) => value || "Dona",
    },
    {
      dataIndex: "availableQuantity",
      title: "Qoldiq",
      align: "right",
      width: 100,
      render: (value) => numberSpacing(Number(value ?? 0), undefined, true),
    },
    {
      dataIndex: "quantity",
      title: "Miqdor",
      width: 100,
      render: (value, record) =>
        isNewRow(record.rowKey) ? (
          <InputNumberFormat standalone value={0} emptyZero disabled />
        ) : (
          <InputNumberFormat
            standalone
            emptyZero
            min={0}
            max={record.availableQuantity}
            precision={3}
            value={value}
            disabled={disabled}
            onValueChange={(quantity) =>
              updateLine(record.rowKey, (line) =>
                recalculateLine({
                  line,
                  quantity: Number(quantity ?? 0),
                  costingMethodId: saleCondition.costingMethodId,
                  keepManualPrice: false,
                }),
              )
            }
          />
        ),
    },
    {
      dataIndex: "costPrice",
      title: "Tannarx",
      align: "right",
      render: (value) => numberSpacing(Number(value ?? 0), undefined, true),
    },
    {
      dataIndex: "unitPrice",
      title: "Sotuv narxi",
      width: 120,
      render: (value, record) => (
        <InputNumberFormat
          standalone
          emptyZero
          value={Number(value ?? 0)}
          disabled={isNewRow(record.rowKey) || disabled}
          precision={2}
          onValueChange={(unitPrice) =>
            updateLine(record.rowKey, (line) =>
              recalculateLine({
                line: {
                  ...line,
                  priceType: "manual",
                  markupPercent: getMarkupPercent(
                    line.costPrice,
                    Number(unitPrice ?? 0),
                  ),
                },
                unitPrice: Number(unitPrice ?? 0),
                costingMethodId: saleCondition.costingMethodId,
              }),
            )
          }
        />
      ),
    },
    {
      dataIndex: "amount",
      title: "Summa",
      align: "right",
      render: (_, record) => numberSpacing(getLineAmount(record), undefined, true),
    },
    {
      dataIndex: "vatRateId",
      title: "QQS (foiz va summa)",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Select
            showSearch
            className="min-w-28"
            value={record.vatRateId ?? undefined}
            disabled={isNewRow(record.rowKey) || disabled}
            optionFilterProp="label"
            options={vatRateOptions.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            onChange={(vatRateId) =>
              updateLine(record.rowKey, (line) => ({ ...line, vatRateId }))
            }
          />
          <span className="min-w-24 text-right">
            {numberSpacing(
              getVatAmount(getLineAmount(record), record.vatRateId, vatRateOptions),
              undefined,
              true,
            )}
          </span>
        </div>
      ),
    },
    {
      dataIndex: "total",
      title: "Jami",
      align: "center",
      render: (_, record) =>
        numberSpacing(getLineTotal(record, vatRateOptions), undefined, true),
    },
    {
      dataIndex: "actions",
      title: "Amallar",
      align: "center",
      width: 80,
      render: (_, record) => (
        <Button
          danger
          type="text"
          icon={<Trash2 className="size-4" />}
          disabled={disabled}
          onClick={() =>
            isNewRow(record.rowKey)
              ? removeEmptyRow(record.rowKey)
              : onChange(products.filter((item) => item.rowKey !== record.rowKey))
          }
        />
      ),
    },
  ];

  const getLayerColumns = (
    vatRateId: number | null | undefined,
  ): TableColumnsType<SaleProductPriceLayer> => [
    {
      dataIndex: "purchaseDocNumber",
      title: "Kirim hujjati",
      width: 180,
      render: (value) => value || "-",
    },
    {
      dataIndex: "purchaseDate",
      title: "Kirim sanasi",
      width: 140,
      render: (value) => value || "-",
    },
    {
      dataIndex: "warehouseName",
      title: "Ombor",
      width: 160,
      render: (value) => value || "-",
    },
    {
      dataIndex: "availableQuantity",
      title: "Mavjud",
      align: "right",
      width: 120,
      render: (value) => numberSpacing(Number(value ?? 0), undefined, true),
    },
    {
      dataIndex: "writeOffQuantity",
      title: "Hisobdan chiqadi",
      align: "right",
      width: 140,
      render: (value) => numberSpacing(Number(value ?? 0), undefined, true),
    },
    {
      dataIndex: "unitPrice",
      title: "Tannarx",
      align: "right",
      width: 140,
      render: (value) => numberSpacing(Number(value ?? 0), undefined, true),
    },
    {
      dataIndex: "salePrice",
      title: "Sotuv narxi",
      align: "right",
      width: 140,
      render: (value) => numberSpacing(Number(value ?? 0), undefined, true),
    },
    {
      dataIndex: "saleAmount",
      title: "Sotuv summasi",
      align: "right",
      width: 150,
      render: (_, record) =>
        numberSpacing(getLayerSaleAmount(record), undefined, true),
    },
    {
      dataIndex: "vatAmount",
      title: "QQS",
      align: "right",
      width: 130,
      render: (_, record) =>
        numberSpacing(
          getVatAmount(getLayerSaleAmount(record), vatRateId, vatRateOptions),
          undefined,
          true,
        ),
    },
    {
      dataIndex: "totalAmount",
      title: "Jami",
      align: "right",
      width: 140,
      render: (_, record) =>
        numberSpacing(getLayerTotal(record, vatRateId, vatRateOptions), undefined, true),
    },
  ];

  const amount = products.reduce((sum, item) => sum + getLineAmount(item), 0);
  const vatAmount = products.reduce(
    (sum, item) => sum + getVatAmount(getLineAmount(item), item.vatRateId, vatRateOptions),
    0,
  );
  const totalAmount = products.reduce(
    (sum, item) => sum + getLineTotal(item, vatRateOptions),
    0,
  );
  const expandedTitle =
    saleCondition.costingMethodId === COSTING_METHOD.LIFO
      ? "LIFO hisobdan chiqarish (avto)"
      : "FIFO hisobdan chiqarish (avto)";

  return (
    <Card className="overflow-hidden border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
        <div className="flex items-center gap-2">
          <Button type="primary">Tovarlar</Button>
          <Button onClick={() => setWarehouseOpen(true)}>
            Omborxona
          </Button>
          {/* <Button>Qo'shimcha</Button> */}
        </div>
        <Input
          className="max-w-80"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Mahsulot qidirish..."
          prefix={<Search className="size-4 text-secondary-text" />}
          allowClear
        />
      </div>
      <Table<SaleSelectedProduct>
        columns={columns}
        dataSource={generateKeyTable(tableRows, "rowKey")}
        pagination={false}
        scroll={{ x: "max-content" }}
        expandable={{
          expandedRowRender: (record) =>
            record.layers?.length ? (
              <div className="px-5 py-3">
                <div className="mb-2 font-semibold">{expandedTitle}</div>
                <Table<SaleProductPriceLayer>
                  size="small"
                  columns={getLayerColumns(record.vatRateId)}
                  dataSource={generateKeyTable(record.layers, "productTableId")}
                  pagination={false}
                  scroll={{ x: "max-content" }}
                />
              </div>
            ) : null,
          rowExpandable: (record) =>
            saleCondition.costingMethodId !== COSTING_METHOD.AVERAGE &&
            Boolean(record.layers?.length),
          defaultExpandAllRows: true,
        }}
      />
      <div className="grid gap-4 border-t border-border p-4 lg:grid-cols-[200px_minmax(240px,1fr)_160px_160px_180px]">
        <Button
          icon={<Plus className="size-4" />}
          onClick={() =>
            setEmptyRowKeys((current) => [
              ...current,
              `${newRowKey}-${Date.now()}`,
            ])
          }
        >
          Tovar qo'shish
        </Button>
        <div>
          <div className="mb-1 text-sm text-muted-second">Kommentariya</div>
          <Input.TextArea
            value={comment}
            placeholder="Kommentariya kiriting"
            onChange={(event) => onCommentChange(event.target.value)}
          />
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-second">Jami summa (QQSsiz):</div>
          <div className="font-semibold">
            {numberSpacing(amount, undefined, true)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-second">Jami QQS:</div>
          <div className="font-semibold">
            {numberSpacing(vatAmount, undefined, true)}
          </div>
        </div>
        <div className="rounded border border-border p-3 text-right">
          <div className="text-sm font-semibold">To'lovga jami:</div>
          <div className="text-lg font-bold">
            {numberSpacing(totalAmount, undefined, true)}
          </div>
        </div>
      </div>
      <SaleWarehouseProductsModal
        open={warehouseOpen}
        products={stockProducts}
        loading={isLoading || isFetching}
        disabled={disabled}
        search={search}
        loadingProductId={loadingProductId}
        onSearch={setSearch}
        onClose={() => setWarehouseOpen(false)}
        onAdd={(product, layer, quantity) =>
          handleSelectProduct(
            getStockProductId(product),
            undefined,
            quantity,
            layer,
          )
        }
      />
    </Card>
  );
}

