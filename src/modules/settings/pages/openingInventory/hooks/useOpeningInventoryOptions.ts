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
  OpeningInventoryMode,
  SelectOption,
} from "../types/type";
import {
  getProductMxik,
  normalizeProductOptions,
} from "../utils/openingInventory";

export const getProductOptionsQueryKey = (mode: OpeningInventoryMode) =>
  [
    "selectlist",
    selectListKeys.product,
    mode === "services"
      ? "opening-inventory-services"
      : "opening-inventory-goods",
  ] as const;

export const fetchProductOptions = async (mode: OpeningInventoryMode) => {
  const { data } = await $axiosPrivate.get<
    ProductSelectOption[] | ProductListResponse
  >(selectListEndpoints.productsSelectList, {
    params: {
      IsService: mode === "services",
      PageSize: 1000,
    },
  });

  return normalizeProductOptions(data);
};

export const useOpeningInventoryOptions = (
  mode: OpeningInventoryMode,
  enabled = true,
) => {
  const productQuery = useQuery<ProductSelectOption[]>({
    queryKey: getProductOptionsQueryKey(mode),
    queryFn: () => fetchProductOptions(mode),
    enabled,
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

  const itemOptions = useMemo<ProductSelectOption[]>(
    () => productQuery.data ?? [],
    [productQuery.data],
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
    data: productQuery.data,
    isFetching: productQuery.isFetching,
    isLoading: productQuery.isLoading,
    isSuccess: productQuery.isSuccess,
    refetchProducts: productQuery.refetch,
    itemOptions,
    ...productMxikLookup,
    unitOptions: unitQuery.data ?? [],
    vatRateOptions: vatRateQuery.data ?? [],
  };
};
