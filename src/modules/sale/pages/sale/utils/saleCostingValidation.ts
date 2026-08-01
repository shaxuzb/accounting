import type {
  SaleProductPriceLayer,
  SaleSelectedProduct,
} from "../types/type";
import { roundMoney } from "./pricing";
import { COSTING_METHOD } from "./salePricingDetails";
import type { TFunction } from "i18next";

const getLayerCostPrice = (layer: SaleProductPriceLayer) =>
  roundMoney(Number(layer.costPrice || layer.unitPrice || 0));

const getLayerCosts = (layers: SaleProductPriceLayer[]) =>
  Array.from(
    new Set(
      layers
        .filter((layer) => layer.writeOffQuantity > 0)
        .map(getLayerCostPrice)
        .filter((cost) => cost > 0),
    ),
  ).sort((left, right) => left - right);

const formatCosts = (costs: number[]) =>
  costs.map((cost) => cost.toLocaleString("ru-RU")).join(", ");

export const getLayerCostValidationError = ({
  costingMethodId,
  productName,
  layers,
}: {
  costingMethodId: number;
  productName: string;
  layers: SaleProductPriceLayer[];
}, t: TFunction) => {
  if (costingMethodId === COSTING_METHOD.AVERAGE) return null;

  const costs = getLayerCosts(layers);
  if (costs.length <= 1) return null;

  return t("sale.messages.differentBatchCosts", {
    product: productName || t("purchase.fields.product"),
    costs: formatCosts(costs),
  });
};

export const getSaleCostingValidationError = ({
  costingMethodId,
  products,
}: {
  costingMethodId: number;
  products: SaleSelectedProduct[];
}, t: TFunction) => {
  if (costingMethodId === COSTING_METHOD.AVERAGE) return null;

  const costsByProduct = new Map<
    number,
    { productName: string; costs: number[] }
  >();

  products.forEach((product) => {
    if (!product.productId) return;

    const selectedLayers = (product.layers ?? []).filter(
      (layer) => layer.writeOffQuantity > 0,
    );
    const costs = selectedLayers.length
      ? getLayerCosts(selectedLayers)
      : product.costPrice > 0
        ? [roundMoney(product.costPrice)]
        : [];
    const current = costsByProduct.get(product.productId);

    if (!current) {
      costsByProduct.set(product.productId, {
        productName: product.productName,
        costs,
      });
      return;
    }

    current.costs = Array.from(new Set([...current.costs, ...costs])).sort(
      (left, right) => left - right,
    );
  });

  for (const [productId, { productName, costs }] of costsByProduct) {
    if (costs.length > 1) {
      return t("sale.messages.differentBatchCosts", {
        product:
          productName || t("sale.messages.productWithId", { id: productId }),
        costs: formatCosts(costs),
      });
    }
  }

  return null;
};
