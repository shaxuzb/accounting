import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  selectListEndpoints,
  selectListKeys,
} from "@/shared/constants/selectLists";
import type {
  ProductListResponse,
  ProductSelectOption,
  PurchaseMode,
  SelectOption,
} from "../types/type";
import {
  getProductMxik,
  normalizeProductOptions,
} from "../utils/purchaseImport";

export const getPurchaseProductOptionsQueryKey = (purchaseMode: PurchaseMode) =>
  [
    "selectlist",
    selectListKeys.product,
    purchaseMode === "services"
      ? "purchase-services-manual"
      : "purchase-goods-manual",
  ] as const;

export const fetchPurchaseProductOptions = async (
  purchaseMode: PurchaseMode,
) => {
  const { data } = await $axiosPrivate.get<
    ProductSelectOption[] | ProductListResponse
  >(selectListEndpoints.productsSelectList, {
    params: {
      IsService: purchaseMode === "services",
      // Purchase mahsulotlari warehouse bo'yicha filterlanmaydi.
      PageSize: 1000,
    },
  });

  return normalizeProductOptions(data);
};

export const usePurchaseImportOptions = (
  purchaseMode: PurchaseMode,
  enabled = true,
) => {
  const productQuery = useQuery<ProductSelectOption[]>({
    queryKey: getPurchaseProductOptionsQueryKey("goods"),
    queryFn: () => fetchPurchaseProductOptions("goods"),
    enabled: enabled && purchaseMode === "goods",
    staleTime: 5 * 60 * 1000,
  });

  const serviceQuery = useQuery<ProductSelectOption[]>({
    queryKey: getPurchaseProductOptionsQueryKey("services"),
    queryFn: () => fetchPurchaseProductOptions("services"),
    enabled: enabled && purchaseMode === "services",
    staleTime: 5 * 60 * 1000,
  });

  const unitQuery = useQuery<SelectOption[]>({
    queryKey: ["selectlist", selectListKeys.unit],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SelectOption[]>(
        selectListEndpoints.unitsSelectList,
      );
      return data ?? [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const vatRateQuery = useQuery<SelectOption[]>({
    queryKey: ["selectlist", selectListKeys.vatRate],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<SelectOption[]>(
        selectListEndpoints.vatRatesSelectList,
      );
      return data ?? [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const activeQuery = purchaseMode === "services" ? serviceQuery : productQuery;
  const itemOptions = useMemo<ProductSelectOption[]>(
    () => activeQuery.data ?? [],
    [activeQuery.data],
  );

  const productMxikLookup = useMemo(() => {
    const groupedProducts = new Map<string, ProductSelectOption[]>();
    const uniqueProducts = new Map(
      itemOptions.map((item) => [Number(item.id), item] as const),
    );

    uniqueProducts.forEach((item) => {
      const mxik = getProductMxik(item);
      if (!mxik) return;

      const products = groupedProducts.get(mxik) ?? [];
      products.push(item);
      groupedProducts.set(mxik, products);
    });

    const productByMxik = new Map<string, ProductSelectOption>();
    const ambiguousMxiks = new Set<string>();
    groupedProducts.forEach((products, mxik) => {
      if (products.length === 1) {
        productByMxik.set(mxik, products[0]);
      } else {
        ambiguousMxiks.add(mxik);
      }
    });

    return {
      productByMxik,
      knownMxiks: new Set(groupedProducts.keys()),
      ambiguousMxiks,
    };
  }, [itemOptions]);

  return {
    data: activeQuery.data,
    isFetching: activeQuery.isFetching,
    isLoading: activeQuery.isLoading,
    isSuccess: activeQuery.isSuccess,
    refetchProducts: activeQuery.refetch,
    itemOptions,
    ...productMxikLookup,
    unitOptions: unitQuery.data ?? [],
    vatRateOptions: vatRateQuery.data ?? [],
  };
};
