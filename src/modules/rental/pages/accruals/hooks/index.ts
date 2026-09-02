import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/types/api";
import { rentalAccrualApi } from "../api";
import { rentalAccrualKeys } from "../constants/queryKeys";
import type {
  RentalAccrualUpdatePayload,
  RentalGenerateDuePayload,
} from "../types/type";

export const useRentalAccruals = (params?: QueryParams) =>
  useQuery({
    queryKey: rentalAccrualKeys.list(
      params instanceof URLSearchParams ? params.toString() : params,
    ),
    queryFn: () => rentalAccrualApi.list(params),
  });

export const useRentalAccrual = (id?: string | number) =>
  useQuery({
    queryKey: rentalAccrualKeys.detail(id ?? ""),
    queryFn: () => rentalAccrualApi.detail(id ?? ""),
    enabled: Boolean(id),
  });

const useAccrualMutation = <TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: rentalAccrualKeys.all });
      if (
        typeof variables === "object" &&
        variables !== null &&
        "id" in variables
      ) {
        queryClient.invalidateQueries({
          queryKey: rentalAccrualKeys.detail(
            (variables as { id: string | number }).id,
          ),
        });
      }
    },
  });
};

export const useUpdateRentalAccrual = () =>
  useAccrualMutation(
    (args: { id: string | number; payload: RentalAccrualUpdatePayload }) =>
      rentalAccrualApi.update(args.id, args.payload),
  );
export const useDeleteRentalAccrual = () =>
  useAccrualMutation((id: string | number) => rentalAccrualApi.delete(id));
export const useGenerateRentalAccruals = () =>
  useAccrualMutation((payload: RentalGenerateDuePayload) =>
    rentalAccrualApi.generateDue(payload),
  );
export const usePostRentalAccrual = () =>
  useAccrualMutation((id: string | number) => rentalAccrualApi.post(id));
export const useCancelRentalAccrual = () =>
  useAccrualMutation((id: string | number) => rentalAccrualApi.cancel(id));
