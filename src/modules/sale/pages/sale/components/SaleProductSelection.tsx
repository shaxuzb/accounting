import { Button, Input, Select, Switch, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { Pencil, Plus, QrCode, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import InputNumberFormat from "@/components/fields/InputNumber";
import Card from "@/components/ui/card/Card";
import {
  selectListEndpoints,
  selectListKeys,
} from "@/shared/constants/selectLists";
import { $axiosPrivate } from "@/services/AxiosService";
import type { SaleCondition } from "@/modules/settings/pages/saleCondition/types/type";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import {
  useGetAvailableSaleProductMarkings,
  useGetProductPriceDetails,
  useGetSaleProductStocks,
  useGetSaleDocumentAccountOptions,
} from "../hooks";
import type {
  SaleProductPriceLayer,
  SaleProductMarking,
  SaleProductStock,
  SaleSelectedProduct,
} from "../types/type";
import {
  getCostingPrices,
  getMarkupPercent,
  getSalePriceByMarkup,
  normalizeProductPriceDetails,
} from "../utils/salePricingDetails";
import SaleWarehouseProductsModal from "./SaleWarehouseProductsModal";
import SaleLineAccountsDrawer, {
  type SaleLineAccountValues,
} from "./SaleLineAccountsModal";
import SaleMarkingModal from "./SaleMarkingModal";

interface Props {
  warehouseId?: number | null;
  comment: string;
  products: SaleSelectedProduct[];
  saleCondition: SaleCondition;
  onCommentChange: (value: string) => void;
  onChange: Dispatch<SetStateAction<SaleSelectedProduct[]>>;
  onCancel: () => void;
  markingMode?: boolean;
  onMarkingModeChange?: (enabled: boolean) => void;
  submitting?: boolean;
  disabled?: boolean;
}

interface VatRateOption {
  id: number;
  name: string;
}

const newRowKey = "__new__";
const EMPTY_STOCK_PRODUCTS: SaleProductStock[] = [];
const isNewRow = (rowKey?: string) => Boolean(rowKey?.startsWith(newRowKey));

const getStockProductId = (product: SaleProductStock) =>
  product.productId || product.id || 0;

const getProductName = (product?: SaleProductStock | null) =>
  product?.productName || product?.name || "-";

const getVatPercent = (
  vatRateId: number | null | undefined,
  options: VatRateOption[],
) => {
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
  getLineAmount(line) +
  getVatAmount(getLineAmount(line), line.vatRateId, vatRates);

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
  Number(product.availableQuantity ?? product.quantity ?? fallback ?? 0);

const getLayerIdentity = (layer: SaleProductPriceLayer) =>
  String(
    layer.batchId ??
      layer.productTableId ??
      layer.purchaseId ??
      layer.id ??
      layer.purchaseDate ??
    "layer",
  );

const trimMarkingsForLayers = (
  markings: SaleProductMarking[] | undefined,
  layers: SaleProductPriceLayer[],
  quantity: number,
) => {
  if (!markings?.length) return [];
  if (!layers.length) return markings.slice(0, Math.max(0, Math.round(quantity)));

  const remainingByBatch = new Map<number, number>();
  layers.forEach((layer) => {
    if (layer.batchId && layer.writeOffQuantity > 0) {
      remainingByBatch.set(layer.batchId, layer.writeOffQuantity);
    }
  });

  return markings.filter((marking) => {
    const batchId = Number(marking.batchId ?? 0);
    const remaining = remainingByBatch.get(batchId) ?? 0;
    if (!batchId || remaining <= 0) return false;

    remainingByBatch.set(batchId, remaining - 1);
    return true;
  });
};

const mergeSelectedLayers = (
  availableLayers: SaleProductPriceLayer[],
  existingLayers: SaleProductPriceLayer[],
  incomingLayers: SaleProductPriceLayer[],
) => {
  const quantities = new Map<string, number>();

  existingLayers.forEach((layer) => {
    quantities.set(getLayerIdentity(layer), layer.writeOffQuantity);
  });
  incomingLayers.forEach((layer) => {
    const key = getLayerIdentity(layer);
    quantities.set(key, (quantities.get(key) ?? 0) + layer.writeOffQuantity);
  });

  return availableLayers
    .map((layer) => ({
      ...layer,
      writeOffQuantity: Math.min(
        quantities.get(getLayerIdentity(layer)) ?? 0,
        layer.availableQuantity,
      ),
    }))
    .filter((layer) => layer.writeOffQuantity > 0);
};

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
  const allocatedLayers = line.priceLayers?.length
    ? line.priceLayers
        .map((layer) => ({
          ...layer,
          writeOffQuantity: Math.min(
            line.layers?.find(
              (selectedLayer) =>
                getLayerIdentity(selectedLayer) === getLayerIdentity(layer),
            )?.writeOffQuantity ?? 0,
            layer.availableQuantity,
          ),
        }))
        .filter((layer) => layer.writeOffQuantity > 0)
    : [];
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
      : prices.unitPrice || getSalePriceByMarkup(nextCostPrice, markupPercent));

  return {
    ...line,
    quantity,
    markings: trimMarkingsForLayers(line.markings, allocatedLayers, quantity),
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
  warehouseId = null,
  comment,
  products,
  saleCondition,
  onCommentChange,
  onChange,
  onCancel,
  markingMode = false,
  onMarkingModeChange,
  submitting = false,
  disabled = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [accountLine, setAccountLine] = useState<SaleSelectedProduct | null>(
    null,
  );
  const [markingLine, setMarkingLine] = useState<SaleSelectedProduct | null>(
    null,
  );
  const [emptyRowKeys, setEmptyRowKeys] = useState<string[]>([newRowKey]);
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);
  const getProductPriceDetails = useGetProductPriceDetails();
  const {
    data: availableMarkingProducts = [],
    isFetching: isAvailableMarkingsFetching,
  } = useGetAvailableSaleProductMarkings(
    markingLine?.productId,
    warehouseId,
    Boolean(markingMode && markingLine?.productId),
  );
  const {
    data: productStockData,
    isLoading: isProductStocksLoading,
    isFetching: isProductStocksFetching,
  } = useGetSaleProductStocks({
    page: 1,
    pageSize: 1000,
    ...(warehouseId ? { warehouseId } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  });
  const stockProducts = productStockData?.items ?? EMPTY_STOCK_PRODUCTS;
  const productById = useMemo(
    () =>
      new Map(
        stockProducts.map((product) => [getStockProductId(product), product]),
      ),
    [stockProducts],
  );

  const getLineIsPieceTracked = (line: SaleSelectedProduct) =>
    productById.get(line.productId)?.isPieceTracked ??
    Boolean(line.isPieceTracked);

  useEffect(() => {
    if (!stockProducts.length || !products.length) return;

    let hasChanges = false;
    const nextProducts = products.map((line) => {
      const stockProduct = productById.get(line.productId);
      if (
        !stockProduct ||
        line.isPieceTracked === stockProduct.isPieceTracked
      ) {
        return line;
      }

      hasChanges = true;
      return {
        ...line,
        isPieceTracked: stockProduct.isPieceTracked,
      };
    });

    if (hasChanges) onChange(nextProducts);
  }, [onChange, productById, products, stockProducts.length]);
  const { data: vatRateOptions = [] } = useQuery<VatRateOption[]>({
    queryKey: ["selectlist", selectListKeys.vatRate],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<VatRateOption[]>(
        selectListEndpoints.vatRatesSelectList,
      );
      return data ?? [];
    },
  });
  const { chartAccounts, defaultAccounts } = useGetSaleDocumentAccountOptions();
  const chartAccountById = useMemo(
    () =>
      new Map(
        chartAccounts.map((account) => [Number(account.id), account] as const),
      ),
    [chartAccounts],
  );

  useEffect(() => {
    if (!products.length) return;

    let hasChanges = false;
    const nextProducts = products.map((line) => {
      if (!line.productId) return line;

      const nextLine = { ...line };
      if (
        nextLine.inventoryAccountId === null &&
        defaultAccounts.inventoryAccountId !== null
      ) {
        nextLine.inventoryAccountId = defaultAccounts.inventoryAccountId;
        nextLine.inventoryAccountName = defaultAccounts.inventoryAccountName;
        hasChanges = true;
      }
      if (
        nextLine.incomeAccountId === null &&
        defaultAccounts.incomeAccountId !== null
      ) {
        nextLine.incomeAccountId = defaultAccounts.incomeAccountId;
        nextLine.incomeAccountName = defaultAccounts.incomeAccountName;
        hasChanges = true;
      }
      if (
        nextLine.costAccountId === null &&
        defaultAccounts.costAccountId !== null
      ) {
        nextLine.costAccountId = defaultAccounts.costAccountId;
        nextLine.costAccountName = defaultAccounts.costAccountName;
        hasChanges = true;
      }

      return nextLine;
    });

    if (hasChanges) onChange(nextProducts);
  }, [defaultAccounts, onChange, products]);
  const productOptions = stockProducts.map((item) => ({
    value: getStockProductId(item),
    label: getProductName(item),
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
      inventoryAccountId: null,
      incomeAccountId: null,
      costAccountId: null,
      vatRateId: saleCondition.vatRateId,
      markupPercent: 0,
      priceType: "costPlusPercent" as const,
    })),
  ];

  const handleSelectProduct = async (
    productId: number,
    rowKey?: string,
    sourceLayers?: SaleProductPriceLayer[],
    overrideSalePrice?: number,
  ) => {
    const product = stockProducts.find(
      (item) => getStockProductId(item) === productId,
    );
    if (!product) return;

    const stockProduct = productById.get(productId);
    if (!stockProduct) {
      toast.error("Mahsulot ma'lumotlari hali yuklanmagan");
      return;
    }

    setLoadingProductId(productId);
    try {
      const response = Array.isArray(product.batches)
        ? product
        : await getProductPriceDetails.mutateAsync(productId);
      const detail = normalizeProductPriceDetails(response, product);
      const existingLine =
        rowKey && !isNewRow(rowKey)
          ? products.find((item) => item.rowKey === rowKey)
          : !rowKey
            ? products.find((item) => item.productId === productId)
            : undefined;
      const salePriceBySelection =
        overrideSalePrice === undefined ? undefined : Number(overrideSalePrice);
      const priceLayers = detail.layers;
      const allocatedLayers = sourceLayers
        ? mergeSelectedLayers(
            priceLayers,
            existingLine?.layers ?? [],
            sourceLayers,
          )
        : existingLine?.layers?.length
          ? mergeSelectedLayers(priceLayers, [], existingLine.layers)
          : [];
      const quantity = allocatedLayers.reduce(
        (sum, layer) => sum + layer.writeOffQuantity,
        0,
      );
      const prices = getCostingPrices({
        costingMethodId: saleCondition.costingMethodId,
        defaultCostPrice: detail.costPrice,
        defaultSalePrice:
          salePriceBySelection ?? existingLine?.unitPrice ?? detail.salePrice,
        layers: allocatedLayers,
      });
      const unitId = detail.unitId || product.unitId || 0;
      if (!unitId) {
        toast.error("Tanlangan mahsulotda birlik topilmadi");
        return;
      }
      const selectedSalePrice =
        salePriceBySelection ??
        existingLine?.unitPrice ??
        detail.salePrice ??
        prices.unitPrice ??
        prices.costPrice ??
        0;
      const nextMarkupPercent = getMarkupPercent(
        prices.costPrice,
        selectedSalePrice,
      );
      const unitPrice = allocatedLayers.length
        ? prices.unitPrice || selectedSalePrice || prices.costPrice
        : selectedSalePrice || prices.unitPrice || prices.costPrice;
      const nextLine: SaleSelectedProduct = {
        id: existingLine?.id,
        rowKey: existingLine?.rowKey ?? `${productId}-${Date.now()}`,
        productId,
        productName: detail.productName || getProductName(product),
        mxik: detail.mxik || product.mxik || product.barcode,
        quantity,
        availableQuantity:
          detail.availableQuantity || getAvailableQuantity(product),
        costPrice: prices.costPrice || detail.costPrice,
        unitId,
        unitName: detail.unitName || product.unitName,
        unitPrice:
          salePriceBySelection === undefined ? unitPrice : salePriceBySelection,
        inventoryAccountId:
          existingLine?.inventoryAccountId ??
          defaultAccounts.inventoryAccountId,
        incomeAccountId:
          existingLine?.incomeAccountId ?? defaultAccounts.incomeAccountId,
        costAccountId:
          existingLine?.costAccountId ?? defaultAccounts.costAccountId,
        inventoryAccountName:
          existingLine?.inventoryAccountName ??
          defaultAccounts.inventoryAccountName,
        incomeAccountName:
          existingLine?.incomeAccountName ?? defaultAccounts.incomeAccountName,
        costAccountName:
          existingLine?.costAccountName ?? defaultAccounts.costAccountName,
        vatRateId: existingLine?.vatRateId ?? saleCondition.vatRateId,
        markings:
          existingLine?.productId === productId
            ? trimMarkingsForLayers(
                existingLine.markings,
                allocatedLayers,
                quantity,
              )
            : [],
        markupPercent:
          salePriceBySelection === undefined
            ? getMarkupPercent(prices.costPrice, unitPrice)
            : nextMarkupPercent,
        priceType:
          salePriceBySelection === undefined
            ? (existingLine?.priceType ?? "costPlusPercent")
            : "manual",
        isPieceTracked: Boolean(stockProduct.isPieceTracked),
        priceLayers,
        layers: allocatedLayers,
      };

      onChange((currentProducts) => {
        const currentExistingLine = currentProducts.find((item) =>
          existingLine
            ? item.rowKey === existingLine.rowKey
            : !rowKey && item.productId === productId,
        );

        return currentExistingLine
          ? currentProducts.map((item) =>
              item.rowKey === currentExistingLine.rowKey ? nextLine : item,
            )
          : [...currentProducts, nextLine];
      });

      if (!existingLine) {
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
      products.map((item) => (item.rowKey === rowKey ? updater(item) : item)),
    );
  };

  const removeEmptyRow = (rowKey?: string) => {
    if (!rowKey) return;
    setEmptyRowKeys((current) => {
      const rest = current.filter((key) => key !== rowKey);
      return rest.length ? rest : [`${newRowKey}-${Date.now()}`];
    });
  };

  const handleAddEmptyRow = () => {
    setEmptyRowKeys((current) => [...current, `${newRowKey}-${Date.now()}`]);
  };

  const updateBatchQuantity = (
    rowKey: string | undefined,
    batch: SaleProductPriceLayer,
    value: number | null,
  ) => {
    updateLine(rowKey, (line) => {
      const availableLayers = line.priceLayers ?? [];
      const nextLayers = availableLayers
        .map((layer) => {
          const currentQuantity =
            line.layers?.find(
              (selectedLayer) =>
                getLayerIdentity(selectedLayer) === getLayerIdentity(layer),
            )?.writeOffQuantity ?? 0;
          const writeOffQuantity =
            getLayerIdentity(layer) === getLayerIdentity(batch)
              ? Math.min(Number(value ?? 0), layer.availableQuantity)
              : currentQuantity;

          return { ...layer, writeOffQuantity };
        })
        .filter((layer) => layer.writeOffQuantity > 0);
      const quantity = nextLayers.reduce(
        (sum, layer) => sum + layer.writeOffQuantity,
        0,
      );
      const costPrice = quantity
        ? nextLayers.reduce(
            (sum, layer) => sum + layer.unitPrice * layer.writeOffQuantity,
            0,
          ) / quantity
        : 0;
      const unitPrice =
        line.priceType === "manual"
          ? line.unitPrice
          : getSalePriceByMarkup(costPrice, line.markupPercent ?? 0);

      return {
        ...line,
        quantity,
        markings: trimMarkingsForLayers(line.markings, nextLayers, quantity),
        costPrice,
        unitPrice,
        layers: nextLayers.map((layer) => ({ ...layer, salePrice: unitPrice })),
      };
    });
  };

  const applyLineAccounts = (
    values: SaleLineAccountValues,
    applyToAll: boolean,
  ) => {
    onChange(
      products.map((item) =>
        applyToAll || item.rowKey === accountLine?.rowKey
          ? {
              ...item,
              inventoryAccountId: values.inventoryAccountId,
              inventoryAccountName: values.inventoryAccountName,
              incomeAccountId: values.incomeAccountId,
              incomeAccountName: values.incomeAccountName,
              costAccountId: values.costAccountId,
              costAccountName: values.costAccountName,
            }
          : item,
      ),
    );
    setAccountLine(null);
  };

  const getAccountNumber = (accountId: number | null | undefined) => {
    if (!accountId) return "—";

    const account = chartAccountById.get(Number(accountId));
    const accountNumber = account?.number ?? account?.code;
    return accountNumber ? String(accountNumber) : String(accountId);
  };

  const getAccountPreview = (line: SaleSelectedProduct) =>
    [
      getAccountNumber(line.inventoryAccountId),
      getAccountNumber(line.incomeAccountId),
      getAccountNumber(line.costAccountId),
    ].join(" / ");

  const activeMarkingLine = markingLine?.rowKey
    ? (products.find((item) => item.rowKey === markingLine.rowKey) ?? null)
    : null;
  const markingBatchSummary = (activeMarkingLine?.layers ?? [])
    .filter((layer) => layer.batchId && layer.writeOffQuantity > 0)
    .map((layer) => ({
      batchId: layer.batchId as number,
      batchNumber: layer.batchNumber || String(layer.batchId),
      batchDate: layer.purchaseDate,
      documentId: layer.documentId,
      documentNumber:
        layer.purchaseDocNumber ||
        (layer.documentId ? String(layer.documentId) : undefined),
      quantity: layer.writeOffQuantity,
      selectedQuantity: (activeMarkingLine.markings ?? []).filter(
        (marking) => marking.batchId === layer.batchId,
      ).length,
    }));

  const openMarkingModal = (line: SaleSelectedProduct) => {
    if (!getLineIsPieceTracked(line)) {
      toast.error("Bu mahsulot markirovkasiz");
      return;
    }

    if (!(line.layers ?? []).some((layer) => layer.batchId && layer.writeOffQuantity > 0)) {
      toast.error("Avval partiya bo'yicha sotiladigan miqdorni kiriting");
      return;
    }

    setMarkingLine({ ...line, isPieceTracked: true });
  };

  const closeMarkingModal = () => {
    setMarkingLine(null);
  };

  const confirmMarkingModal = () => {
    if (!activeMarkingLine) return;

    if (
      (activeMarkingLine.markings?.length ?? 0) !==
      Math.round(activeMarkingLine.quantity)
    ) {
      toast.error("Har bir dona uchun markirovka kiritilishi kerak");
      return;
    }

    closeMarkingModal();
  };

  const handleAddMarking = (inputValue: string) => {
    if (!activeMarkingLine) return;

    if (isAvailableMarkingsFetching) {
      toast("Markirovkalar tekshirilmoqda");
      return;
    }

    const values = inputValue
      .split(/[\s,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (!values.length) return;

    const nextMarkings: SaleProductMarking[] = [
      ...(activeMarkingLine.markings ?? []),
    ];

    const availableProduct = availableMarkingProducts.find(
      (product) => Number(product.productId) === Number(activeMarkingLine.productId),
    );
    const availableBatches = availableProduct?.batches ?? [];
    const remainingByBatch = new Map<number, number>();

    (activeMarkingLine.layers ?? []).forEach((layer) => {
      if (layer.batchId && layer.writeOffQuantity > 0) {
        remainingByBatch.set(layer.batchId, layer.writeOffQuantity);
      }
    });

    if (!remainingByBatch.size) {
      toast.error("Avval partiya bo'yicha sotiladigan miqdorni kiriting");
      return;
    }

    nextMarkings.forEach((marking) => {
      if (!marking.batchId) return;
      remainingByBatch.set(
        marking.batchId,
        Math.max(0, (remainingByBatch.get(marking.batchId) ?? 0) - 1),
      );
    });

    let hasNewMarkings = false;
    for (const markingNumber of values) {
      if (nextMarkings.length >= Math.round(activeMarkingLine.quantity)) {
        toast.error("Miqdor bo'yicha barcha markirovka kiritilgan");
        break;
      }

      if (
        nextMarkings.some(
          (marking) => marking.markingNumber === markingNumber,
        ) ||
        products.some((product) =>
          product.rowKey !== activeMarkingLine.rowKey &&
          product.markings?.some(
            (marking) => marking.markingNumber === markingNumber,
          ),
        )
      ) {
        toast.error("Bu markirovka avval qo'shilgan");
        continue;
      }

      const availableBatch = availableBatches.find((batch) =>
        batch.productTables.some(
          (table) => table.markingNumber === markingNumber,
        ),
      );
      const availableTable = availableBatch?.productTables.find(
        (table) => table.markingNumber === markingNumber,
      );

      if (!availableBatch || !availableTable) {
        toast.error("Markirovka mavjud mahsulotlar ro'yxatida topilmadi");
        continue;
      }

      const remainingQuantity = remainingByBatch.get(availableBatch.batchId) ?? 0;
      if (remainingQuantity <= 0) {
        toast.error("Bu partiya uchun kiritilgan miqdor to'ldi");
        continue;
      }

      nextMarkings.push({
        markingNumber,
        productTableId: availableTable.productTableId,
        batchId: availableBatch.batchId,
      });
      remainingByBatch.set(availableBatch.batchId, remainingQuantity - 1);
      hasNewMarkings = true;
    }

    if (hasNewMarkings) {
      onChange(
        products.map((product) =>
          product.rowKey === activeMarkingLine.rowKey
            ? { ...product, markings: nextMarkings }
            : product,
        ),
      );
    }
  };

  const columns: TableColumnsType<SaleSelectedProduct> = [
    {
      dataIndex: "indexId",
      title: "T/r",
      align: "center",
      className: "whitespace-nowrap",
    },
    {
      dataIndex: "productName",
      title: "Mahsulot",
      width: 450,
      render: (_, record) => (
        <Select
          showSearch
          className="w-full"
          placeholder="Mahsulot"
          value={record.productId || undefined}
          loading={
            isProductStocksLoading ||
            isProductStocksFetching ||
            loadingProductId === record.productId
          }
          options={productOptions.map((option) => ({
            ...option,
            disabled: products.some(
              (item) =>
                item.productId === Number(option.value) &&
                item.rowKey !== record.rowKey,
            ),
          }))}
          disabled={disabled || isProductStocksLoading}
          onChange={(value) =>
            handleSelectProduct(Number(value), record.rowKey)
          }
        />
      ),
    },
    {
      dataIndex: "mxik",
      title: "MXIK kod",
      render: (value) => value || "-",
    },
    ...(markingMode
      ? [
          {
            dataIndex: "markings",
            title: "Markirovka",
            align: "center" as const,
            render: (_: unknown, record: SaleSelectedProduct) => {
              if (isNewRow(record.rowKey)) return "-";

              const quantity = Math.round(record.quantity);
              const markingCount = record.markings?.length ?? 0;
              const isPieceTracked = getLineIsPieceTracked(record);
              if (isPieceTracked && markingCount === quantity) {
                return <Tag color="success">Urilgan</Tag>;
              }

              return isPieceTracked ? (
                <Button
                  type="text"
                  disabled={disabled}
                  icon={<QrCode className="size-4" />}
                  onClick={() => openMarkingModal(record)}
                >
                  {markingCount}/{quantity}
                </Button>
              ) : (
                <Tag>Markirovkasiz</Tag>
              );
            },
          },
        ]
      : []),
    {
      dataIndex: "unitName",
      title: "Birlik",
      render: (value) => value || "Dona",
    },
    {
      dataIndex: "availableQuantity",
      title: "Qoldiq",
      align: "center",
      render: (value) => numberSpacing(Number(value ?? 0)),
    },
    {
      dataIndex: "quantity",
      title: "Miqdor",
      width: 100,
      render: (value, record) =>
        isNewRow(record.rowKey) ? (
          <InputNumberFormat
            standalone
            value={0}
            emptyZero
            disabled
            height={30}
          />
        ) : (
          <InputNumberFormat
            standalone
            height={30}
            emptyZero
            min={0}
            max={record.availableQuantity}
            precision={3}
            value={value}
            disabled={disabled || Boolean(record.priceLayers?.length)}
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
      align: "center",
      render: (value) => numberSpacing(Number(value ?? 0)),
    },
    {
      dataIndex: "unitPrice",
      title: "Sotuv narxi",
      width: 120,
      render: (value, record) => (
        <InputNumberFormat
          standalone
          height={30}
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
      align: "center",
      render: (_, record) => numberSpacing(getLineAmount(record)),
    },
    {
      dataIndex: "vatRateId",
      title: "QQS (foiz va summa)",
      render: (_, record) => (
        <div className="flex items-center">
          <Select
            showSearch
            className="min-w-28"
            value={record.vatRateId ?? undefined}
            disabled={isNewRow(record.rowKey) || disabled}
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
              getVatAmount(
                getLineAmount(record),
                record.vatRateId,
                vatRateOptions,
              ),
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
        numberSpacing(getLineTotal(record, vatRateOptions)),
    },
    {
      dataIndex: "accounts",
      title: "Hisobvaraqlar",
      render: (_, record) => (
        <div className="flex min-w-30 items-center">
          <span
            className="min-w-0 flex-1 truncate text-xs"
            title={getAccountPreview(record)}
          >
            {isNewRow(record.rowKey) ? "—" : getAccountPreview(record)}
          </span>
          <Button
            type="text"
            size="small"
            icon={<Pencil className="size-4" />}
            disabled={isNewRow(record.rowKey) || disabled}
            title="Hisobvaraqlarni tanlash"
            onClick={() => setAccountLine(record)}
          />
        </div>
      ),
    },
    {
      dataIndex: "actions",
      // title: "Amallar",
      align: "center",
      render: (_, record) => (
        <Button
          danger
          type="text"
          icon={<Trash2 className="size-4" />}
          disabled={disabled}
          onClick={() =>
            isNewRow(record.rowKey)
              ? removeEmptyRow(record.rowKey)
              : onChange(
                  products.filter((item) => item.rowKey !== record.rowKey),
                )
          }
        />
      ),
    },
  ];

  const getLayerColumns = (
    line: SaleSelectedProduct,
  ): TableColumnsType<SaleProductPriceLayer> => [
    {
      dataIndex: "batchNumber",
      title: "Partiya raqami",
      render: (value, record) => value || record.batchId || "-",
    },
    {
      dataIndex: "purchaseDate",
      title: "Kirim sanasi",
      render: (value) => customDate(value),
    },
    {
      dataIndex: "availableQuantity",
      title: "Mavjud",
      align: "center",
      render: (value) => numberSpacing(Number(value ?? 0)),
    },
    {
      dataIndex: "writeOffQuantity",
      title: "Sotiladigan",
      align: "center",
      width: 50,
      render: (_, record) => (
        <InputNumberFormat
          standalone
          emptyZero
          min={0}
          max={record.availableQuantity}
          precision={3}
          value={
            line.layers?.find(
              (layer) => getLayerIdentity(layer) === getLayerIdentity(record),
            )?.writeOffQuantity ?? 0
          }
          disabled={disabled}
          onValueChange={(value) =>
            updateBatchQuantity(line.rowKey, record, value)
          }
        />
      ),
    },
    {
      dataIndex: "unitPrice",
      title: "Tannarx",
      align: "center",
      render: (value) => numberSpacing(Number(value ?? 0)),
    },
    {
      dataIndex: "salePrice",
      title: "Sotuv narxi",
      align: "center",
      render: () => numberSpacing(Number(line.unitPrice ?? 0)),
    },
    {
      dataIndex: "saleAmount",
      title: "Sotuv summasi",
      align: "center",
      render: (_, record) =>
        numberSpacing(
          getLayerSaleAmount({ ...record, salePrice: line.unitPrice }),
        ),
    },
    {
      dataIndex: "vatAmount",
      title: "QQS",
      align: "center",
      render: (_, record) =>
        numberSpacing(
          getVatAmount(
            getLayerSaleAmount({ ...record, salePrice: line.unitPrice }),
            line.vatRateId,
            vatRateOptions,
          ),
          undefined,
          true,
        ),
    },
    {
      dataIndex: "totalAmount",
      title: "Jami",
      align: "center",
      render: (_, record) =>
        numberSpacing(
          getLayerTotal(
            { ...record, salePrice: line.unitPrice },
            line.vatRateId,
            vatRateOptions,
          ),
          undefined,
          true,
        ),
    },
  ];

  const amount = products.reduce((sum, item) => sum + getLineAmount(item), 0);
  const vatAmount = products.reduce(
    (sum, item) =>
      sum + getVatAmount(getLineAmount(item), item.vatRateId, vatRateOptions),
    0,
  );
  const totalAmount = products.reduce(
    (sum, item) => sum + getLineTotal(item, vatRateOptions),
    0,
  );
  return (
    <Card className="overflow-hidden border border-border">
      <div className="flex w-full flex-nowrap items-center justify-between gap-3 overflow-x-auto border-b border-border p-3">
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <Button type="primary">Tovarlar</Button>
          <Button className="w-32" onClick={() => setWarehouseOpen(true)}>
            Omborxona
          </Button>
          <Button
            className="w-32"
            icon={<Plus className="size-4" />}
            onClick={handleAddEmptyRow}
          >
            Tovar qo'shish
          </Button>
          {/* <Button>Qo'shimcha</Button> */}
        </div>
        {onMarkingModeChange && (
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium">Markirovka bilan</span>
            <Switch
              checked={markingMode}
              disabled={disabled}
              onChange={onMarkingModeChange}
            />
          </div>
        )}
        <div className="flex shrink-0 items-center justify-end gap-2 whitespace-nowrap">
          {/* <Input
            className="w-64 max-w-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Mahsulot qidirish..."
            prefix={<Search className="size-4 text-secondary-text" />}
            allowClear
          /> */}
          <Button
            className="w-32"
            size="medium"
            icon={<X className="size-4" />}
            onClick={onCancel}
          >
            Bekor qilish
          </Button>
          <Button
            className="w-42"
            type="primary"
            size="medium"
            htmlType="submit"
            icon={<Save className="size-4" />}
            loading={submitting}
          >
            Rasmiylashtirish
          </Button>
        </div>
      </div>
      <Table<SaleSelectedProduct>
        columns={columns}
        dataSource={generateKeyTable(tableRows, "rowKey")}
        pagination={false}
        scroll={{ x: "max-content" }}
        expandable={{
          expandedRowRender: (record) =>
            record.priceLayers?.length ? (
              <div className="px-5 py-3">
                <div className="mb-2 font-semibold">Partiyalar</div>
                <Table<SaleProductPriceLayer>
                  size="small"
                  columns={getLayerColumns(record)}
                  dataSource={generateKeyTable(record.priceLayers, "batchId")}
                  pagination={false}
                  scroll={{ x: "max-content" }}
                />
              </div>
            ) : null,
          rowExpandable: (record) => Boolean(record.priceLayers?.length),
          defaultExpandAllRows: true,
        }}
      />
      <div className="border-t border-border p-4">
        <div className="mb-4">
          <div>
            <div className="mb-1 text-sm text-muted-second">Kommentariya</div>
            <Input.TextArea
              value={comment}
              placeholder="Kommentariya kiriting"
              onChange={(event) => onCommentChange(event.target.value)}
            />
          </div>
        </div>
        <div className="grid overflow-hidden rounded-lg border border-border bg-primary-bg sm:grid-cols-3">
          <div className="border-b border-border px-4 py-3 text-center sm:border-b-0 sm:border-r">
            <div className="text-xs text-secondary-text">Summa (QQSsiz)</div>
            <div className="mt-1 text-base font-semibold">
              {numberSpacing(amount, undefined, true)}
            </div>
          </div>
          <div className="border-b border-border px-4 py-3 text-center sm:border-b-0 sm:border-r">
            <div className="text-xs text-secondary-text">Summa QQS</div>
            <div className="mt-1 text-base font-semibold">
              {numberSpacing(vatAmount, undefined, true)}
            </div>
          </div>
          <div className="bg-primary/5 px-4 py-3 text-center">
            <div className="text-xs text-secondary-text">Jami</div>
            <div className="mt-1 text-base font-bold text-primary">
              {numberSpacing(totalAmount, undefined, true)}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 z-10 flex justify-center border-t border-border bg-primary-bg/95 py-2 backdrop-blur">
          <Tooltip title="Qator qo'shish">
            <Button
              type="primary"
              shape="circle"
              size="large"
              className="shadow-md"
              icon={<Plus className="size-5" />}
              onClick={handleAddEmptyRow}
            />
          </Tooltip>
        </div>
      </div>
      <SaleWarehouseProductsModal
        open={warehouseOpen}
        products={stockProducts}
        loading={isProductStocksLoading || isProductStocksFetching}
        disabled={disabled}
        search={search}
        loadingProductId={loadingProductId}
        onSearch={setSearch}
        onClose={() => setWarehouseOpen(false)}
        onAdd={(product, layers, salePrice) =>
          handleSelectProduct(
            getStockProductId(product),
            undefined,
            layers,
            salePrice,
          )
        }
      />
      <SaleLineAccountsDrawer
        open={Boolean(accountLine)}
        line={accountLine}
        onClose={() => setAccountLine(null)}
        onApply={applyLineAccounts}
      />
      <SaleMarkingModal
        open={Boolean(activeMarkingLine)}
        productName={activeMarkingLine?.productName ?? ""}
        quantity={Math.round(activeMarkingLine?.quantity ?? 0)}
        markings={activeMarkingLine?.markings ?? []}
        batches={markingBatchSummary}
        loading={isAvailableMarkingsFetching}
        onScan={handleAddMarking}
        onConfirm={confirmMarkingModal}
        onClose={closeMarkingModal}
      />
    </Card>
  );
}
