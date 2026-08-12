import { $axiosPrivate } from "@/services/AxiosService";

export interface DocumentAccountOption {
  id: number;
  number?: string | number | null;
  code?: string | number | null;
  name?: string | null;
  accountId?: number | string | null;
  accountNumber?: string | number | null;
  accountName?: string | null;
  chartAccountId?: number | string | null;
  chartAccountNumber?: string | number | null;
  chartAccountName?: string | null;
  accountCode?: string | number | null;
  chartAccountCode?: string | number | null;
}

export interface DocumentAccountSettingsRoleLike {
  documentAccountRoleCode: string;
  accounts?: Array<{
    chartAccountId: number;
    chartAccountName?: string | null;
    chartAccountNumber?: string | number | null;
    isDefault?: boolean;
  }>;
}

export const documentAccountQueryKeys = {
  all: ["document-account-settings", "chart-accounts"] as const,
  options: (
    documentTypeId: string | number,
    documentRoleCode: string,
    organizationId: number | null,
  ) =>
    [
      ...documentAccountQueryKeys.all,
      documentTypeId,
      documentRoleCode,
      organizationId,
    ] as const,
} as const;

export const documentAccountChartAccountsPath = (
  documentTypeId: string | number,
) => `document-account-settings/${documentTypeId}/chart-accounts`;

export const normalizeDocumentAccountOptions = <
  T extends DocumentAccountOption = DocumentAccountOption,
>(payload: unknown): T[] => {
  const normalizeCollection = (collection: unknown): T[] => {
    if (!Array.isArray(collection)) return [];

    return collection
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const source = item as Record<string, unknown>;
        const nested =
          source.chartAccount && typeof source.chartAccount === "object"
            ? (source.chartAccount as Record<string, unknown>)
            : source.account && typeof source.account === "object"
              ? (source.account as Record<string, unknown>)
              : {};
        const value = { ...nested, ...source };
        const id = Number(
          value.id ?? value.chartAccountId ?? value.accountId ?? value.value,
        );
        if (!Number.isFinite(id) || id <= 0) return null;

        return {
          ...value,
          id,
          number:
            value.number ??
            value.chartAccountNumber ??
            value.accountNumber ??
            value.accountCode ??
            value.chartAccountCode ??
            (/^\d+(?:\.\d+)*$/.test(String(value.name ?? "").trim())
              ? value.name
              : null),
          code:
            value.code ??
            value.chartAccountCode ??
            value.accountCode ??
            null,
          name:
            value.name ??
            value.chartAccountName ??
            value.accountName ??
            null,
        } as T;
      })
      .filter((item): item is T => Boolean(item));
  };

  if (Array.isArray(payload)) return normalizeCollection(payload);

  if (payload && typeof payload === "object") {
    const response = payload as {
      items?: unknown;
      data?: unknown;
      results?: unknown;
    };
    const collection = response.items ?? response.data ?? response.results;
    return normalizeCollection(collection);
  }

  return [];
};

export const getDefaultDocumentAccount = (
  settings: { accountSettings?: DocumentAccountSettingsRoleLike[] } | undefined,
  roleCode: string,
) => {
  const normalizedRoleCode = roleCode.trim().toLowerCase();
  const role = settings?.accountSettings?.find(
    (item) =>
      item.documentAccountRoleCode.trim().toLowerCase() === normalizedRoleCode,
  );
  const account = role?.accounts?.find((item) => item.isDefault) ?? role?.accounts?.[0];

  return {
    id:
      account?.chartAccountId ??
      (account as { accountId?: number | null } | undefined)?.accountId ??
      null,
    name:
      account?.chartAccountName ??
      (account as { accountName?: string | null } | undefined)?.accountName ??
      (account?.chartAccountNumber ? String(account.chartAccountNumber) : ""),
  };
};

export const fetchDocumentAccountOptions = async <
  T extends DocumentAccountOption = DocumentAccountOption,
>(
  documentTypeId: string | number,
  documentRoleCode: string,
) => {
  const { data } = await $axiosPrivate.get<unknown>(
    documentAccountChartAccountsPath(documentTypeId),
    { params: { documentRoleCode } },
  );
  return normalizeDocumentAccountOptions<T>(data);
};
