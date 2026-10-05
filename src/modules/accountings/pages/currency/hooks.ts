import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currencyService } from "./api";
import { currencyKeys, UZS_CURRENCY_ID } from "./constants";
import type { RevaluationRequest } from "./types";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

export const useCurrencyRates = (params: object) =>
  useQuery({
    queryKey: currencyKeys.rates(params),
    queryFn: () => currencyService.rates(params),
  });

/** The Central Bank rate of a currency on a date; nothing to ask for UZS. */
export const useRateOnDate = (currencyId?: number | null, date?: string | null) =>
  useQuery({
    queryKey: currencyKeys.rateOnDate(currencyId ?? 0, date ?? ""),
    queryFn: () => currencyService.rateOnDate(currencyId!, date!),
    enabled: !!currencyId && currencyId !== UZS_CURRENCY_ID && !!date,
    staleTime: 10 * 60 * 1000,
  });

export const useImportRates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => currencyService.importByDate(date),
    onError: errorHandlers,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["currency-rates"] });
      void queryClient.invalidateQueries({ queryKey: ["currency-rate-on-date"] });
    },
  });
};

export const useRevaluations = (params: object) =>
  useQuery({
    queryKey: currencyKeys.revaluations(params),
    queryFn: () => currencyService.revaluations(params),
  });

export const useRevaluation = (id: number | null) =>
  useQuery({
    queryKey: currencyKeys.revaluation(id ?? 0),
    queryFn: () => currencyService.revaluation(id!),
    enabled: !!id,
  });

export const usePreviewRevaluation = () =>
  useMutation({
    mutationFn: (body: RevaluationRequest) => currencyService.preview(body),
    onError: errorHandlers,
  });

/** Saves the revaluation and posts it at once, as one action of the user. */
export const usePostRevaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: RevaluationRequest) => {
      const created = await currencyService.create(body);
      await currencyService.confirm(created.id);
      return created;
    },
    onError: errorHandlers,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: currencyKeys.allRevaluations }),
  });
};

export const useCancelRevaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => currencyService.cancel(id),
    onError: errorHandlers,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: currencyKeys.allRevaluations });
      void queryClient.invalidateQueries({ queryKey: ["currency-revaluation"] });
    },
  });
};
