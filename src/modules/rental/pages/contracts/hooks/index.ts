import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryParams } from "@/shared/types/api";
import { rentalContractApi } from "../api";
import { rentalContractKeys } from "../constants/queryKeys";
export { useLookupRentalLessor } from "./useLookupRentalLessor";
export { default as useRentalLessorLookup } from "./useRentalLessorLookup";

export const useRentalContracts = (params?: QueryParams) =>
  useQuery({
    queryKey: rentalContractKeys.list(
      params instanceof URLSearchParams ? params.toString() : params,
    ),
    queryFn: () => rentalContractApi.list(params),
  });

export const useRentalContract = (id?: string | number) =>
  useQuery({
    queryKey: rentalContractKeys.detail(id ?? ""),
    queryFn: () => rentalContractApi.detail(id ?? ""),
    enabled: Boolean(id),
  });

const useContractMutation = <TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: rentalContractKeys.all });
      if (
        typeof variables === "object" &&
        variables !== null &&
        "id" in variables
      ) {
        queryClient.invalidateQueries({
          queryKey: rentalContractKeys.detail(
            (variables as { id: string | number }).id,
          ),
        });
      }
    },
  });
};

export const useCreateRentalContract = () =>
  useContractMutation((payload: object) => rentalContractApi.create(payload));
export const useUpdateRentalContract = () =>
  useContractMutation((args: { id: string | number; payload: object }) =>
    rentalContractApi.update(args.id, args.payload),
  );
export const useDeleteRentalContract = () =>
  useContractMutation((id: string | number) => rentalContractApi.delete(id));
export const useActivateRentalContract = () =>
  useContractMutation((id: string | number) => rentalContractApi.activate(id));
export const useCancelRentalContract = () =>
  useContractMutation((id: string | number) => rentalContractApi.cancel(id));
