import { useMemo } from "react";
import { useGetListDocumentAccountSettings } from "@/modules/settings/pages/documentAccountSettings/hooks";
import { faDocumentTypeCodes } from "../constants/documentAccounts";

export default function useFaDocumentTypeIds() {
  const query = useGetListDocumentAccountSettings();

  const ids = useMemo(() => {
    const items = query.data?.items ?? [];
    const findId = (code: string) =>
      items.find(
        (item) => item.documentTypeCode.trim().toLowerCase() === code,
      )?.documentTypeId;

    return {
      receipt: findId(faDocumentTypeCodes.receipt),
      commissioning: findId(faDocumentTypeCodes.commissioning),
      depreciation: findId(faDocumentTypeCodes.depreciation),
      revaluation: findId(faDocumentTypeCodes.revaluation),
      disposal: findId(faDocumentTypeCodes.disposal),
    };
  }, [query.data?.items]);

  return {
    ...ids,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
