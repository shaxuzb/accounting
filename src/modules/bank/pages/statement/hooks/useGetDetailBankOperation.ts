import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { bankStatementEndpoints } from "../constants/endpoints";
import type { BankOperationData } from "../types/type";

export const useGetDetailBankOperation = (id?: string | number) =>
  useQuery({
    queryKey: ["bankOperation", "detail", id],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<BankOperationData>(
        bankStatementEndpoints.operations.update(id ?? ""),
      );
      return data;
    },
    enabled: Boolean(id),
  });
