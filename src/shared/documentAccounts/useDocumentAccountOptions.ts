import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import type { DocumentAccountOption } from "./documentAccounts";
import {
  documentAccountQueryKeys,
  fetchDocumentAccountOptions,
} from "./documentAccounts";

export const useDocumentAccountOptions = <
  T extends DocumentAccountOption = DocumentAccountOption,
>(
  documentTypeId: string | number | null | undefined,
  documentRoleCode: string | null | undefined,
  enabled = true,
) => {
  const organizationId = useAppSelector((state) => state.organization.id || null);
  const canFetch =
    enabled &&
    Boolean(documentTypeId) &&
    Boolean(documentRoleCode) &&
    Boolean(organizationId);

  return useQuery<T[]>({
    queryKey: documentAccountQueryKeys.options(
      documentTypeId ?? 0,
      documentRoleCode ?? "",
      organizationId,
    ),
    queryFn: () =>
      fetchDocumentAccountOptions<T>(documentTypeId ?? 0, documentRoleCode ?? ""),
    enabled: canFetch,
    staleTime: 5 * 60 * 1000,
  });
};
