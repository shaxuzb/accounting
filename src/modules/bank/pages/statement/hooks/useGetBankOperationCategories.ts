import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";
import { normalizeDocumentAccountOptions } from "@/shared/documentAccounts";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { useAppSelector } from "@/store/hooks";

export interface BankOperationCategoryOption {
  id: number;
  code?: string;
  name?: string;
}

export const useGetBankOperationCategories = () => {
  const lang = useAppSelector((state) => state.lang.lang);
  const organizationId = useAppSelector((state) => state.organization.id);

  return useQuery({
    queryKey: ["selectlist", "bank-operation-categories", lang, organizationId],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<unknown>(
        selectListEndpoints.bankOperationCategoriesSelectList,
      );
      return normalizeDocumentAccountOptions<BankOperationCategoryOption>(data);
    },
    staleTime: 5 * 60 * 1000,
  });
};
