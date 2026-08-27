import { Button, Input, Select, Switch, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { Pencil, Plus, QrCode, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useGetAvailableSaleProductMarkings,
  useGetProductPriceDetails,
  useGetProductByMarking,
  useGetSaleProductStocks,
  useGetSaleDocumentAccountOptions,
} from "../hooks";
import type {
  SaleProductPriceLayer,
  SaleProductMarking,
  SaleAvailableProduct,
  SaleProductStock,
  SaleSelectedProduct,
} from "../types/type";
import {
  getCostingPrices,
  getMarkupPercent,
  getSalePriceByMarkup,
  normalizeProductPriceDetails,
} from "../utils/salePricingDetails";
import { saleDocumentTypeId } from "../constants/documentAccount";
// import { getLayerCostValidationError } from "../utils/saleCostingValidation";
import { roundMoney } from "../utils/pricing";
import SaleWarehouseProductsModal from "./SaleWarehouseProductsModal";
import SaleLineAccountsDrawer, {
  type SaleLineAccountValues,
} from "./SaleLineAccountsModal";
import SaleMarkingModal from "./SaleMarkingModal";
import { useTranslation } from "react-i18next";

interface Props {
  warehouseId?: number | null;
  comment: string;
  products: SaleSelectedProduct[];
  saleCondition: SaleCondition;
  onCommentChange: (value: string) => void;
  onChange: (products: SaleSelectedProduct[]) => void;
  onTotalsChange?: (totalAmount: number) => void;
  documentTypeId?: number;
  onCancel: () => void;
  markingMode?: boolean;
  onMarkingModeChange?: (enabled: boolean) => void;
  disableMarkingQuantityValidation?: boolean;
  aggregateStockMode?: boolean;
  submitting?: boolean;
  disabled?: boolean;
}

interface VatRateOption {
  id: number;
  name: string;
}

const newRowKey = "__new__";
const tableControlHeight = 32;
const EMPTY_STOCK_PRODUCTS: SaleProductStock[] = [];
const EMPTY_VAT_RATE_OPTIONS: VatRateOption[] = [];
const EMPTY_MARKING_PRODUCTS: SaleAvailableProduct[] = [];
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
  return percent ? roundMoney((amount * percent) / 100) : 0;
};

const getNetAmountFromGross = (
  grossAmount: number,
  vatRateId: number | null | undefined,
  options: VatRateOption[],
) => {
  const percent = getVatPercent(vatRateId, options);
  return percent
    ? roundMoney(grossAmount / (1 + percent / 100))
      : roundMoney(grossAmount);
};

const getLineAmount = (line: SaleSelectedProduct) =>
  roundMoney(line.quantity * line.unitPrice);

const getGrossUnitPrice = (
  line: SaleSelectedProduct,
  vatRates: VatRateOption[],
) =>
  roundMoney(
    line.unitPrice + getVatAmount(line.unitPrice, line.vatRateId, vatRates),
  );

const getGrossUnitPriceFromTotal = (
  grossTotal: number | null | undefined,
  quantity: number | null | undefined,
) => {
  const lineQuantity = Number(quantity ?? 0);
  return lineQuantity > 0
    ? roundMoney(Number(grossTotal ?? 0) / lineQuantity)
    : 0;
};

const getLayerSaleAmount = (layer: SaleProductPriceLayer) =>
  layer.writeOffQuantity * layer.salePrice;

const getLayerVatAmount = (
  layer: SaleProductPriceLayer,
  vatRateId: number | null | undefined,
  vatRates: VatRateOption[],
) =>
  roundMoney(
    getVatAmount(layer.salePrice, vatRateId, vatRates) *
      layer.writeOffQuantity,
  );

// QQS dona narxidan hisoblanadi. Shu usulda 2 571 428,56 QQS saqlanadi,
// satr jami esa 24 000 000 bo‘lib qoladi.
const getLineTotal = (line: SaleSelectedProduct, vatRates: VatRateOption[]) =>
  roundMoney(getLineAmount(line) + getLineVatAmount(line, vatRates));

const getLineVatAmount = (
  line: SaleSelectedProduct,
  vatRates: VatRateOption[],
) =>
  roundMoney(
    getVatAmount(line.unitPrice, line.vatRateId, vatRates) * line.quantity,
  );

const getLineNetAmount = (line: SaleSelectedProduct) =>
  getLineAmount(line);

const getLayerTotal = (
  layer: SaleProductPriceLayer,
  vatRateId: number | null | undefined,
  vatRates: VatRateOption[],
) => {
  const amount = roundMoney(getLayerSaleAmount(layer));
  const vatAmount = getLayerVatAmount(layer, vatRateId, vatRates);
  return roundMoney(amount + vatAmount);
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
  if (!layers.length)
    return markings.slice(0, Math.max(0, Math.round(quantity)));

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
  const nextCostPrice =
    line.costPriceType === "manual"
      ? line.costPrice
      : prices.costPrice || line.costPrice;
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
  onTotalsChange,
  documentTypeId,
  onCancel,
  markingMode = false,
  onMarkingModeChange,
  disableMarkingQuantityValidation = false,
  aggregateStockMode = false,
  submitting = false,
  disabled = false,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [accountLine, setAccountLine] = useState<SaleSelectedProduct | null>(
    null,
  );
  const [markingLine, setMarkingLine] = useState<SaleSelectedProduct | null>(
    null,
  );
  const [emptyRowKeys, setEmptyRowKeys] = useState<string[]>([newRowKey]);
  const [manualTotalValues, setManualTotalValues] = useState<
    Record<string, number | null>
  >({});
  const [manualSalePriceValues, setManualSalePriceValues] = useState<
    Record<string, number | null>
  >({});
  const manualTotalValuesRef = useRef<Record<string, number | null>>({});
  const manualSalePriceValuesRef = useRef<Record<string, number | null>>({});
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);
  const getProductPriceDetails = useGetProductPriceDetails();
  const {
    data: availableMarkingProductsData,
    isFetching: isAvailableMarkingsFetching,
  } = useGetAvailableSaleProductMarkings(
    markingLine?.productId,
    warehouseId,
    Boolean(markingMode && markingLine?.productId),
  );
  const availableMarkingProducts =
    availableMarkingProductsData ?? EMPTY_MARKING_PRODUCTS;
  const getProductByMarking = useGetProductByMarking();
  const {
    data: productStockData,
    isLoading: isProductStocksLoading,
    isFetching: isProductStocksFetching,
  } = useGetSaleProductStocks(
    {
      page: 1,
      pageSize: 1000,
      ...(warehouseId ? { warehouseId } : {}),
    },
    Boolean(warehouseId),
  );
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
  const { data: vatRateData } = useQuery<VatRateOption[]>({
    queryKey: ["selectlist", selectListKeys.vatRate],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<VatRateOption[]>(
        selectListEndpoints.vatRatesSelectList,
      );
      return data ?? [];
    },
  });
  const vatRateOptions = vatRateData ?? EMPTY_VAT_RATE_OPTIONS;
  const syncLineAmounts = useCallback(
    (line: SaleSelectedProduct): SaleSelectedProduct => ({
      ...line,
      amount: getLineTotal(line, vatRateOptions),
      netAmount: getLineNetAmount(line),
      vatAmount: getLineVatAmount(line, vatRateOptions),
    }),
    [vatRateOptions],
  );

  useEffect(() => {
    if (!products.length || !vatRateOptions.length) return;

    let hasChanges = false;
    const nextProducts = products.map((line) => {
      if (!line.productId) return line;

      const nextLine = syncLineAmounts(line);
      if (
        line.amount === nextLine.amount &&
        line.vatAmount === nextLine.vatAmount
      ) {
        return line;
      }

      hasChanges = true;
      return nextLine;
    });

    if (hasChanges) onChange(nextProducts);
  }, [onChange, products, syncLineAmounts, vatRateOptions]);

  const { chartAccounts, defaultAccounts } = useGetSaleDocumentAccountOptions(
    documentTypeId ?? saleDocumentTypeId,
  );
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
        nextLine.inventoryAccountId == null &&
        defaultAccounts.inventoryAccountId !== null
      ) {
        nextLine.inventoryAccountId = defaultAccounts.inventoryAccountId;
        nextLine.inventoryAccountName = defaultAccounts.inventoryAccountName;
        hasChanges = true;
      }
      if (
        nextLine.incomeAccountId == null &&
        defaultAccounts.incomeAccountId !== null
      ) {
        nextLine.incomeAccountId = defaultAccounts.incomeAccountId;
        nextLine.incomeAccountName = defaultAccounts.incomeAccountName;
        hasChanges = true;
      }
      if (
        nextLine.costAccountId == null &&
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
  const productOptions = useMemo(
    () =>
      stockProducts.map((item) => ({
        value: getStockProductId(item),
        label: getProductName(item),
      })),
    [stockProducts],
  );
  const tableRows = useMemo<SaleSelectedProduct[]>(
    () => [
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
    ],
    [emptyRowKeys, products, saleCondition.vatRateId],
  );
  const tableData = useMemo(
    () => generateKeyTable(tableRows, "rowKey") ?? [],
    [tableRows],
  );

  const handleSelectProduct = async (
    productId: number,
    rowKey?: string,
    sourceLayers?: SaleProductPriceLayer[],
    overrideSalePrice?: number,
    sourceQuantity?: number,
  ) => {
    const product = productById.get(productId);
    if (!product) return;

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
      const priceLayers = aggregateStockMode ? [] : detail.layers;
      const allocatedLayers = aggregateStockMode
        ? []
        : sourceLayers
          ? mergeSelectedLayers(
              priceLayers,
              existingLine?.layers ?? [],
              sourceLayers,
            )
          : existingLine?.layers?.length
            ? mergeSelectedLayers(priceLayers, [], existingLine.layers)
            : [];
      // Turli partiyalarning tannarxi har xil bo'lishi mumkinligi sababli
      // vaqtinchalik tannarx bir xilligi cheklovi o'chirildi.
      // const layerCostValidationError = getLayerCostValidationError({
      //   costingMethodId: saleCondition.costingMethodId,
      //   productName: detail.productName || getProductName(product),
      //   layers: allocatedLayers,
      // }, t);
      // if (layerCostValidationError) {
      //   toast.error(layerCostValidationError);
      //   return;
      // }
      const quantity = aggregateStockMode
        ? Math.min(
            Math.max(Number(sourceQuantity ?? 0), 0),
            detail.availableQuantity || getAvailableQuantity(product),
          )
        : allocatedLayers.reduce(
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
        toast.error(t("sale.messages.unitMissing"));
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
        costPrice:
          existingLine?.costPriceType === "manual"
            ? existingLine.costPrice
            : prices.costPrice || detail.costPrice,
        costPriceType: existingLine?.costPriceType,
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
        isPieceTracked: Boolean(product.isPieceTracked),
        priceLayers,
        layers: allocatedLayers,
      };

      const currentExistingLine = products.find((item) =>
        existingLine
          ? item.rowKey === existingLine.rowKey
          : !rowKey && item.productId === productId,
      );
      const calculatedNextLine = syncLineAmounts(nextLine);
      onChange(
        currentExistingLine
          ? products.map((item) =>
              item.rowKey === currentExistingLine.rowKey
                ? calculatedNextLine
                : item,
            )
          : [...products, calculatedNextLine],
      );

      if (!existingLine) {
        if (isNewRow(rowKey)) {
          setEmptyRowKeys((current) => {
            const rest = current.filter((key) => key !== rowKey);
            return rest.length ? rest : [`${newRowKey}-${Date.now()}`];
          });
        }
      }
    } catch (error) {
      errorHandlers(error);
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
        item.rowKey === rowKey ? syncLineAmounts(updater(item)) : item,
      ),
    );
  };

  const clearManualTotal = (rowKey?: string) => {
    if (!rowKey) return;

    const nextRefValues = { ...manualTotalValuesRef.current };
    delete nextRefValues[rowKey];
    manualTotalValuesRef.current = nextRefValues;
    setManualTotalValues((current) => {
      if (!Object.prototype.hasOwnProperty.call(current, rowKey)) {
        return current;
      }

      const next = { ...current };
      delete next[rowKey];
      return next;
    });
  };

  const clearManualSalePrice = (rowKey?: string) => {
    if (!rowKey) return;

    const nextRefValues = { ...manualSalePriceValuesRef.current };
    delete nextRefValues[rowKey];
    manualSalePriceValuesRef.current = nextRefValues;
    setManualSalePriceValues((current) => {
      if (!Object.prototype.hasOwnProperty.call(current, rowKey)) {
        return current;
      }

      const next = { ...current };
      delete next[rowKey];
      return next;
    });
  };

  const applyManualTotal = (
    rowKey: string | undefined,
    grossAmount: number | null | undefined,
  ) => {
    if (!rowKey) return;

    clearManualSalePrice(rowKey);

    updateLine(rowKey, (line) => {
      const gross = roundMoney(Number(grossAmount ?? 0));
      const netAmount = getNetAmountFromGross(
        gross,
        line.vatRateId,
        vatRateOptions,
      );
      const quantity = Number(line.quantity ?? 0);
      const unitPrice = quantity > 0 ? roundMoney(netAmount / quantity) : 0;

      return recalculateLine({
        line: {
          ...line,
          priceType: "manual",
          markupPercent: getMarkupPercent(line.costPrice, unitPrice),
        },
        unitPrice,
        costingMethodId: saleCondition.costingMethodId,
      });
    });
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
    clearManualTotal(rowKey);
    clearManualSalePrice(rowKey);
    updateLine(rowKey, (line) => {
      const availableLayers = line.priceLayers ?? [];
      const selectedQuantityByLayer = new Map(
        (line.layers ?? []).map((selectedLayer) => [
          getLayerIdentity(selectedLayer),
          selectedLayer.writeOffQuantity,
        ]),
      );
      const nextLayers = availableLayers
        .map((layer) => {
          const currentQuantity =
            selectedQuantityByLayer.get(getLayerIdentity(layer)) ?? 0;
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
      // Turli partiyalarning tannarxi har xil bo'lishi mumkinligi sababli
      // vaqtinchalik tannarx bir xilligi cheklovi o'chirildi.
      // const layerCostValidationError = getLayerCostValidationError({
      //   costingMethodId: saleCondition.costingMethodId,
      //   productName: line.productName,
      //   layers: nextLayers,
      // }, t);
      // if (layerCostValidationError) {
      //   toast.error(layerCostValidationError);
      //   return line;
      // }
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
    return accountNumber ? String(accountNumber) : "—";
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
      toast.error(t("sale.messages.notPieceTracked"));
      return;
    }

    // Partiya bo'yicha miqdor kiritilganini majburiy tekshirish vaqtincha o'chirildi.
    // if (!(line.layers ?? []).some((layer) => layer.batchId && layer.writeOffQuantity > 0)) {
    //   toast.error(t("sale.messages.enterBatchQuantityFirst"));
    //   return;
    // }

    setMarkingLine({ ...line, isPieceTracked: true });
  };

  const closeMarkingModal = () => {
    setMarkingLine(null);
  };

  const confirmMarkingModal = () => {
    if (!activeMarkingLine) return;

    // Retail-sale uchun markirovka soni va tovar soni tengligi tekshiruvi vaqtincha o'chirilgan.
    if (
      !disableMarkingQuantityValidation &&
      (activeMarkingLine.markings?.length ?? 0) !==
        Math.round(activeMarkingLine.quantity)
    ) {
      toast.error(t("sale.messages.markingPerPieceRequired"));
      return;
    }

    closeMarkingModal();
  };

  const handleAddMarking = async (inputValue: string) => {
    if (!activeMarkingLine) return;

    if (!aggregateStockMode && isAvailableMarkingsFetching) {
      toast(t("sale.messages.markingsChecking"));
      return;
    }

    const values = inputValue
      .split(/[\r\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (!values.length) return;

    const nextMarkings: SaleProductMarking[] = [
      ...(activeMarkingLine.markings ?? []),
    ];

    const availableProduct = availableMarkingProducts.find(
      (product) =>
        Number(product.productId) === Number(activeMarkingLine.productId),
    );
    const availableBatches = availableProduct?.batches ?? [];
    const remainingByBatch = new Map<number, number>();

    (activeMarkingLine.layers ?? []).forEach((layer) => {
      if (layer.batchId && layer.writeOffQuantity > 0) {
        remainingByBatch.set(layer.batchId, layer.writeOffQuantity);
      }
    });
    const hasSelectedBatches = remainingByBatch.size > 0;

    // Partiya bo'yicha miqdor kiritilganini majburiy tekshirish vaqtincha o'chirildi.
    // if (!remainingByBatch.size) {
    //   toast.error(t("sale.messages.enterBatchQuantityFirst"));
    //   return;
    // }

    nextMarkings.forEach((marking) => {
      if (!marking.batchId) return;
      remainingByBatch.set(
        marking.batchId,
        Math.max(0, (remainingByBatch.get(marking.batchId) ?? 0) - 1),
      );
    });

    let hasNewMarkings = false;
    const showMarkingError = (message: string, id: string) =>
      toast.error(message, { id: `sale-marking-${id}` });

    for (const markingNumber of values) {
      if (nextMarkings.length >= Math.round(activeMarkingLine.quantity)) {
        showMarkingError(t("sale.messages.allMarkingsEntered"), "all-entered");
        break;
      }

      if (
        nextMarkings.some(
          (marking) => marking.markingNumber === markingNumber,
        ) ||
        products.some(
          (product) =>
            product.rowKey !== activeMarkingLine.rowKey &&
            product.markings?.some(
              (marking) => marking.markingNumber === markingNumber,
            ),
        )
      ) {
        showMarkingError(t("sale.messages.duplicateMarking"), "duplicate");
        continue;
      }

      if (aggregateStockMode) {
        try {
          const markingProduct =
            await getProductByMarking.mutateAsync(markingNumber);
          const productTableId = Number(
            markingProduct.productTableId ?? markingProduct.id ?? 0,
          );

          if (
            Number(markingProduct.productId) !==
              Number(activeMarkingLine.productId) ||
            !productTableId
          ) {
            showMarkingError(
              t("sale.messages.markingProductNotFound"),
              "not-found",
            );
            continue;
          }

          nextMarkings.push({
            markingNumber: markingProduct.markingNumber || markingNumber,
            productTableId,
          });
          hasNewMarkings = true;
          continue;
        } catch {
          showMarkingError(
            t("sale.messages.markingProductNotFound"),
            "not-found",
          );
          continue;
        }
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
        showMarkingError(
          t("sale.messages.markingProductNotFound"),
          "not-found",
        );
        continue;
      }

      const remainingQuantity =
        remainingByBatch.get(availableBatch.batchId) ?? 0;
      if (hasSelectedBatches && remainingQuantity <= 0) {
        showMarkingError(t("sale.messages.batchQuantityFull"), "batch-full");
        continue;
      }

      nextMarkings.push({
        markingNumber,
        productTableId: availableTable.productTableId,
        batchId: availableBatch.batchId,
      });
      if (hasSelectedBatches) {
        remainingByBatch.set(availableBatch.batchId, remainingQuantity - 1);
      }
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
      title: t("common.rowNumber"),
      align: "center",
      className: "whitespace-nowrap",
    },
    {
      dataIndex: "productName",
      title: t("sale.fields.product"),
      width: 450,
      render: (_, record) => (
        <Select
          showSearch
          size="middle"
          className="w-full"
          popupMatchSelectWidth={false}
          placeholder={t("purchase.fields.product")}
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
      title: t("sale.fields.mxik"),
      width: 180,
      render: (value) => value || "-",
    },
    ...(markingMode
      ? [
          {
            dataIndex: "markings",
            title: t("app.fields.marking"),
            width: 240,
            align: "center" as const,
            render: (_: unknown, record: SaleSelectedProduct) => {
              if (isNewRow(record.rowKey)) return "-";

              const quantity = Math.round(record.quantity);
              const markingCount = record.markings?.length ?? 0;
              const isPieceTracked = getLineIsPieceTracked(record);
              if (isPieceTracked && markingCount === quantity) {
                return <Tag color="success">{t("sale.fields.marked")}</Tag>;
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
                <Button
                  type="text"
                  disabled
                  icon={<QrCode className="size-4" />}
                >
                  {t("sale.messages.notPieceTracked")}
                </Button>
              );
            },
          },
        ]
      : []),
    {
      dataIndex: "unitName",
      title: t("purchase.fields.unit"),
      width: 120,
      render: (value) => value || t("sale.fields.piece"),
    },
    {
      dataIndex: "availableQuantity",
      title: t("warehouse.lines.stock"),
      width: 120,
      align: "center",
      render: (value) => numberSpacing(Number(value ?? 0)),
    },
    {
      dataIndex: "quantity",
      title: t("openingInventory.fields.quantity"),
      width: 120,
      render: (value, record) =>
        isNewRow(record.rowKey) ? (
          <InputNumberFormat
            standalone
            value={0}
            emptyZero
            disabled
            height={tableControlHeight}
          />
        ) : (
          <InputNumberFormat
            standalone
            height={tableControlHeight}
            emptyZero
            min={0}
            max={record.availableQuantity}
            precision={3}
            value={value}
            disabled={disabled || Boolean(record.priceLayers?.length)}
            onValueChange={(quantity) => {
              clearManualTotal(record.rowKey);
              clearManualSalePrice(record.rowKey);
              updateLine(record.rowKey, (line) =>
                recalculateLine({
                  line,
                  quantity: Number(quantity ?? 0),
                  costingMethodId: saleCondition.costingMethodId,
                  keepManualPrice: false,
                }),
              );
            }}
          />
        ),
    },
    {
      dataIndex: "costPrice",
      title: t("warehouse.fields.costPrice"),
      align: "center",
      width: 160,
      render: (value, record) => (
        <InputNumberFormat
          standalone
          height={tableControlHeight}
          emptyZero
          min={0}
          value={Number(value ?? 0)}
          disabled={isNewRow(record.rowKey) || disabled}
          precision={2}
          onValueChange={(costPrice) =>
            updateLine(record.rowKey, (line) => {
              const nextCostPrice = roundMoney(Number(costPrice ?? 0));

              return {
                ...line,
                costPrice: nextCostPrice,
                costPriceType: "manual",
                markupPercent: getMarkupPercent(nextCostPrice, line.unitPrice),
              };
            })
          }
        />
      ),
    },
    {
      dataIndex: "unitPrice",
      title: t("sale.fields.salePrice"),
      width: 170,
      render: (_, record) => {
        const priceInputKey = record.rowKey ?? `product-${record.productId}`;
        const hasManualSalePrice = Object.prototype.hasOwnProperty.call(
          manualSalePriceValues,
          priceInputKey,
        );
        const hasManualTotal = Object.prototype.hasOwnProperty.call(
          manualTotalValues,
          priceInputKey,
        );

        return (
          <InputNumberFormat
            standalone
            height={tableControlHeight}
            emptyZero
            min={0}
            precision={2}
            value={
              hasManualSalePrice
                ? manualSalePriceValues[priceInputKey]
                : hasManualTotal
                  ? getGrossUnitPriceFromTotal(
                      manualTotalValues[priceInputKey],
                      record.quantity,
                    )
                  : getGrossUnitPrice(record, vatRateOptions)
            }
            disabled={isNewRow(record.rowKey) || disabled}
            onValueChange={(salePrice) => {
              clearManualTotal(record.rowKey);
              manualSalePriceValuesRef.current = {
                ...manualSalePriceValuesRef.current,
                [priceInputKey]: salePrice,
              };
              setManualSalePriceValues((current) => ({
                ...current,
                [priceInputKey]: salePrice,
              }));
            }}
            onBlur={() => {
              const grossSalePrice =
                manualSalePriceValuesRef.current[priceInputKey];
              clearManualTotal(record.rowKey);
              clearManualSalePrice(record.rowKey);
              updateLine(record.rowKey, (line) => {
                const nextSalePrice = getNetAmountFromGross(
                  Number(grossSalePrice ?? 0),
                  line.vatRateId,
                  vatRateOptions,
                );

                return recalculateLine({
                  line: {
                    ...line,
                    priceType: "manual",
                    markupPercent: getMarkupPercent(
                      line.costPrice,
                      nextSalePrice,
                    ),
                  },
                  unitPrice: nextSalePrice,
                  costingMethodId: saleCondition.costingMethodId,
                });
              });
            }}
          />
        );
      },
    },
    {
      dataIndex: "vatRateId",
      title: t("sale.fields.vatRateAndAmount"),
      width: 270,
      render: (_, record) => (
        <div className="flex h-8 items-center gap-2">
          <Select
            showSearch
            size="middle"
            className="min-w-28"
            value={record.vatRateId ?? undefined}
            disabled={isNewRow(record.rowKey) || disabled}
            options={vatRateOptions.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            onChange={(vatRateId) => {
              clearManualTotal(record.rowKey);
              clearManualSalePrice(record.rowKey);
              updateLine(record.rowKey, (line) => ({ ...line, vatRateId }));
            }}
          />
          <span className="min-w-24 text-right">
            {numberSpacing(
              getLineVatAmount(record, vatRateOptions),
              undefined,
              true,
            )}
          </span>
        </div>
      ),
    },
    {
      dataIndex: "total",
      title: t("sale.fields.totalWithVat"),
      align: "center",
      width: 190,
      render: (_, record) => {
        const totalInputKey = record.rowKey ?? `product-${record.productId}`;
        const hasManualTotal = Object.prototype.hasOwnProperty.call(
          manualTotalValues,
          totalInputKey,
        );

        return (
          <InputNumberFormat
            standalone
            height={tableControlHeight}
            emptyZero
            min={0}
            value={
              hasManualTotal
                ? manualTotalValues[totalInputKey]
                : getLineTotal(record, vatRateOptions)
            }
            disabled={isNewRow(record.rowKey) || disabled}
            precision={2}
            onValueChange={(grossAmount) => {
              manualTotalValuesRef.current = {
                ...manualTotalValuesRef.current,
                [totalInputKey]: grossAmount,
              };
              setManualTotalValues((current) => ({
                ...current,
                [totalInputKey]: grossAmount,
              }));
              manualSalePriceValuesRef.current = {
                ...manualSalePriceValuesRef.current,
                [totalInputKey]: getGrossUnitPriceFromTotal(
                  grossAmount,
                  record.quantity,
                ),
              };
              setManualSalePriceValues((current) => ({
                ...current,
                [totalInputKey]: getGrossUnitPriceFromTotal(
                  grossAmount,
                  record.quantity,
                ),
              }));
            }}
            onBlur={() =>
              applyManualTotal(
                record.rowKey,
                manualTotalValuesRef.current[totalInputKey],
              )
            }
          />
        );
      },
    },
    {
      dataIndex: "accounts",
      title: t("openingInventory.fields.accounts"),
      width: 280,
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
            title={t("sale.actions.selectAccounts")}
            onClick={() => setAccountLine(record)}
          />
        </div>
      ),
    },
    {
      dataIndex: "actions",
      width: 70,
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
      title: t("sale.fields.batchNumber"),
      render: (value, record) => value || record.batchId || "-",
    },
    {
      dataIndex: "purchaseDate",
      title: t("sale.fields.receiptDate"),
      render: (value) => customDate(value),
    },
    {
      dataIndex: "availableQuantity",
      title: t("sale.fields.available"),
      align: "center",
      render: (value) => numberSpacing(Number(value ?? 0)),
    },
    {
      dataIndex: "writeOffQuantity",
      title: t("sale.fields.quantityToSell"),
      align: "center",
      width: 50,
      render: (_, record) => (
        <InputNumberFormat
          standalone
          height={tableControlHeight}
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
      title: t("warehouse.fields.costPrice"),
      align: "center",
      render: (value) => numberSpacing(Number(value ?? 0)),
    },
    {
      dataIndex: "salePrice",
      title: t("sale.fields.salePrice"),
      align: "center",
      render: () => numberSpacing(Number(line.unitPrice ?? 0)),
    },
    {
      dataIndex: "saleAmount",
      title: t("sale.fields.saleAmount"),
      align: "center",
      render: (_, record) =>
        numberSpacing(
          getLayerSaleAmount({ ...record, salePrice: line.unitPrice }),
        ),
    },
    {
      dataIndex: "vatAmount",
      title: t("settings.fields.vatRate"),
      align: "center",
      render: (_, record) =>
        numberSpacing(
          getLayerVatAmount(
            { ...record, salePrice: line.unitPrice },
            line.vatRateId,
            vatRateOptions,
          ),
          undefined,
          true,
        ),
    },
    {
      dataIndex: "totalAmount",
      title: t("common.total"),
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

  const totals = useMemo(
    () =>
      products.reduce(
        (summary, item) => {
          const lineAmount = getLineNetAmount(item);
          const lineVatAmount = getLineVatAmount(item, vatRateOptions);

          return {
            amount: summary.amount + lineAmount,
            vatAmount: summary.vatAmount + lineVatAmount,
            totalAmount: summary.totalAmount + lineAmount + lineVatAmount,
          };
        },
        { amount: 0, vatAmount: 0, totalAmount: 0 },
      ),
    [products, vatRateOptions],
  );

  useEffect(() => {
    onTotalsChange?.(totals.totalAmount);
  }, [onTotalsChange, totals.totalAmount]);

  return (
    <Card className="overflow-hidden border border-border">
      <div className="flex w-full flex-nowrap items-center justify-between gap-3 overflow-x-auto border-b border-border p-3">
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <Button type="primary">{t("purchase.fields.goods")}</Button>
          <Button
            className="w-32"
            disabled={disabled || !warehouseId}
            onClick={() => setWarehouseOpen(true)}
          >
            {t("menu.warehouse")}
          </Button>
          <Button
            className="w-32"
            icon={<Plus className="size-4" />}
            onClick={handleAddEmptyRow}
          >
            {t("sale.actions.addGoods")}
          </Button>
          {/* <Button>Qo'shimcha</Button> */}
        </div>
        {onMarkingModeChange && (
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium">
              {t("sale.actions.withMarking")}
            </span>
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
            {t("common.cancel")}
          </Button>
          <Button
            className="w-42"
            type="primary"
            size="medium"
            htmlType="submit"
            icon={<Save className="size-4" />}
            loading={submitting}
          >
            {t("sale.actions.formalize")}
          </Button>
        </div>
      </div>
      <Table<SaleSelectedProduct>
        columns={columns}
        dataSource={tableData}
        pagination={false}
        tableLayout="auto"
        scroll={{ x: 2450 }}
        expandable={
          aggregateStockMode
            ? undefined
            : {
                expandedRowRender: (record) =>
                  record.priceLayers?.length ? (
                    <div className="px-5 py-3">
                      <div className="mb-2 font-semibold">
                        {t("sale.fields.batches")}
                      </div>
                      <Table<SaleProductPriceLayer>
                        size="small"
                        columns={getLayerColumns(record)}
                        dataSource={generateKeyTable(
                          record.priceLayers,
                          "batchId",
                        )}
                        pagination={false}
                        tableLayout="auto"
                        scroll={{ x: 900 }}
                      />
                    </div>
                  ) : null,
                rowExpandable: (record) => Boolean(record.priceLayers?.length),
                defaultExpandAllRows: false,
              }
        }
      />
      <div className="border-t border-border p-4">
        <div className="mb-4">
          <div>
            <div className="mb-1 text-sm text-muted-second">
              {t("sale.fields.comment")}
            </div>
            <Input.TextArea
              value={comment}
              placeholder={t("sale.messages.commentPlaceholder")}
              onChange={(event) => onCommentChange(event.target.value)}
            />
          </div>
        </div>
        <div className="grid overflow-hidden rounded-lg border border-border bg-primary-bg sm:grid-cols-3">
          <div className="border-b border-border px-4 py-3 text-center sm:border-b-0 sm:border-r">
            <div className="text-xs text-secondary-text">
              {t("sale.fields.amountWithoutVat")}
            </div>
            <div className="mt-1 text-base font-semibold">
              {numberSpacing(totals.amount, undefined, true)}
            </div>
          </div>
          <div className="border-b border-border px-4 py-3 text-center sm:border-b-0 sm:border-r">
            <div className="text-xs text-secondary-text">
              {t("sale.fields.vatAmount")}
            </div>
            <div className="mt-1 text-base font-semibold">
              {numberSpacing(totals.vatAmount, undefined, true)}
            </div>
          </div>
          <div className="bg-primary/5 px-4 py-3 text-center">
            <div className="text-xs text-secondary-text">
              {t("common.total")}
            </div>
            <div className="mt-1 text-base font-bold text-primary">
              {numberSpacing(totals.totalAmount, undefined, true)}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 z-10 flex justify-center border-t border-border bg-primary-bg/95 py-2 backdrop-blur">
          <Tooltip title={t("sale.actions.addLine")}>
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
        aggregateStockMode={aggregateStockMode}
        vatPercent={getVatPercent(saleCondition.vatRateId, vatRateOptions)}
        disabled={disabled}
        search={search}
        loadingProductId={loadingProductId}
        onSearch={setSearch}
        onClose={() => setWarehouseOpen(false)}
        onAdd={(product, layers, salePrice, quantity) =>
          handleSelectProduct(
            getStockProductId(product),
            undefined,
            layers,
            salePrice,
            quantity,
          )
        }
      />
      <SaleLineAccountsDrawer
        open={Boolean(accountLine)}
        line={accountLine}
        documentTypeId={documentTypeId ?? saleDocumentTypeId}
        onClose={() => setAccountLine(null)}
        onApply={applyLineAccounts}
      />
      <SaleMarkingModal
        open={Boolean(activeMarkingLine)}
        productName={activeMarkingLine?.productName ?? ""}
        quantity={Math.round(activeMarkingLine?.quantity ?? 0)}
        markings={activeMarkingLine?.markings ?? []}
        batches={markingBatchSummary}
        loading={
          (aggregateStockMode ? false : isAvailableMarkingsFetching) ||
          getProductByMarking.isPending
        }
        onScan={handleAddMarking}
        onConfirm={confirmMarkingModal}
        onClose={closeMarkingModal}
      />
    </Card>
  );
}
