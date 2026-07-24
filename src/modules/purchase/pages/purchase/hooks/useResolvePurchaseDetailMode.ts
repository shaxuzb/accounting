import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  ProductSelectOption,
  PurchaseDetailData,
  PurchaseMode,
} from "../types/type";
import { getPurchaseModeFromDetail } from "../utils/purchaseImport";
import {
  fetchPurchaseProductOptions,
  getPurchaseProductOptionsQueryKey,
} from "./usePurchaseImportOptions";

interface ResolvedPurchaseDetailMode {
  mode: PurchaseMode | null;
  isResolving: boolean;
}

export const useResolvePurchaseDetailMode = (
  detail: PurchaseDetailData | undefined,
  enabled: boolean,
): ResolvedPurchaseDetailMode => {
  const structuralMode = useMemo(
    () => (detail ? getPurchaseModeFromDetail(detail) : null),
    [detail],
  );
  const needsServiceProductLookup = Boolean(
    enabled &&
      detail &&
      structuralMode === "goods" &&
      detail.lines?.length,
  );
  const serviceProductsQuery = useQuery<ProductSelectOption[]>({
    queryKey: getPurchaseProductOptionsQueryKey("services"),
    queryFn: () => fetchPurchaseProductOptions("services"),
    enabled: needsServiceProductLookup,
    staleTime: 5 * 60 * 1000,
  });

  const mode = useMemo<PurchaseMode | null>(() => {
    if (!detail || !structuralMode) return null;
    if (!needsServiceProductLookup) return structuralMode;
    if (serviceProductsQuery.isError) return structuralMode;
    if (!serviceProductsQuery.isSuccess) return null;

    return getPurchaseModeFromDetail(
      detail,
      (serviceProductsQuery.data ?? []).map((item) => item.id),
    );
  }, [
    detail,
    needsServiceProductLookup,
    serviceProductsQuery.data,
    serviceProductsQuery.isError,
    serviceProductsQuery.isSuccess,
    structuralMode,
  ]);

  return {
    mode,
    isResolving: Boolean(enabled && detail && mode === null),
  };
};
