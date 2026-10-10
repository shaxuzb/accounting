import { useQuery, type QueryClient } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";

/** Nomenclature accounts (1C «Счета учета номенклатуры»). */
export const productAccountEndpoints = {
  root: "product-accounts",
  byId: (id: number) => `product-accounts/${id}`,
  kinds: "product-accounts/kinds",
  resolve: "product-accounts/resolve",
} as const;

export const productAccountQueryKeys = {
  all: ["product-accounts"] as const,
  overview: ["product-accounts", "overview"] as const,
  kinds: ["product-accounts", "kinds"] as const,
  resolved: (productId: number) => ["product-accounts", "resolved", productId] as const,
};

export interface ProductAccountRef {
  id: number;
  number: string;
  name: string;
}

/** A nomenclature kind with the accounts its numbers find in the organization's chart. */
export interface ProductKind {
  id: number;
  code: string;
  name: string;
  isService: boolean;
  stockAccountNumber?: string | null;
  incomeAccountNumber?: string | null;
  costAccountNumber?: string | null;
  stockAccount?: ProductAccountRef | null;
  incomeAccount?: ProductAccountRef | null;
  costAccount?: ProductAccountRef | null;
}

/** The accounts a product's document lines take; null: the document settings decide. */
export interface ResolvedProductAccounts {
  productId: number;
  productKindId: number;
  stockAccount?: ProductAccountRef | null;
  incomeAccount?: ProductAccountRef | null;
  costAccount?: ProductAccountRef | null;
}

export const accountLabel = (account?: ProductAccountRef | null) =>
  account ? `${account.number} — ${account.name}` : "";

export const useProductKinds = () =>
  useQuery({
    queryKey: productAccountQueryKeys.kinds,
    queryFn: () => $axiosPrivate.get<ProductKind[]>(productAccountEndpoints.kinds).then((response) => response.data),
    staleTime: 5 * 60 * 1000,
  });

/**
 * The accounts of these products, one request for the ones not cached yet. A line takes them
 * in place of the document setting's default; what comes back empty keeps that default.
 */
export const resolveProductAccounts = async (
  queryClient: QueryClient,
  productIds: number[],
): Promise<Map<number, ResolvedProductAccounts>> => {
  const ids = [...new Set(productIds.filter((id) => Number.isFinite(id) && id > 0))];
  const result = new Map<number, ResolvedProductAccounts>();
  const missing: number[] = [];
  for (const id of ids) {
    const cached = queryClient.getQueryData<ResolvedProductAccounts>(productAccountQueryKeys.resolved(id));
    if (cached) result.set(id, cached);
    else missing.push(id);
  }
  if (missing.length > 0) {
    try {
      const { data } = await $axiosPrivate.post<ResolvedProductAccounts[]>(productAccountEndpoints.resolve, {
        productIds: missing,
      });
      for (const item of data ?? []) {
        queryClient.setQueryData(productAccountQueryKeys.resolved(item.productId), item);
        result.set(item.productId, item);
      }
    } catch {
      // the document settings' defaults stay on the line
    }
  }
  return result;
};

/** Forget the resolved accounts once the nomenclature accounts or a product's kind change. */
export const invalidateProductAccounts = (queryClient: QueryClient) =>
  queryClient.removeQueries({ queryKey: productAccountQueryKeys.all });
