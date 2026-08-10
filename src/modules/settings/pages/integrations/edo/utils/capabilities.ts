import type {
  EdoCapabilitiesResponseDto,
  EdoCapabilityKind,
  EdoCapabilityStatus,
  EdoDocumentCategory,
  EdoDocumentDirection,
  EdoFilterCode,
  EdoProviderDto,
  EdoStatusOptionDto,
} from "../types/type";

const capabilityFieldByKind: Partial<
  Record<EdoCapabilityKind, keyof EdoCapabilitiesResponseDto["capabilities"]>
> = {
  ListInbox: "canListInbox",
  ListOutbox: "canListOutbox",
  ListDrafts: "canListDrafts",
  ListAll: "canListAll",
  AggregateAll: "canAggregateAll",
  GetDetail: "canGetDetail",
  GetFile: "canGetFile",
  GetInboxStatus: "canGetStatus",
  GetOutboxStatus: "canGetStatus",
  CreateFactura: "canCreate",
  SignOutbox: "canSign",
  RejectInbox: "canReject",
};

const statusByAuthKind: Partial<Record<EdoCapabilityKind, string>> = {
  AuthChallenge: "AuthChallenge",
  AuthComplete: "AuthComplete",
};

export const getCapabilityStatus = (
  capabilities: EdoCapabilitiesResponseDto | null | undefined,
  kind: EdoCapabilityKind,
): EdoCapabilityStatus => {
  if (!capabilities) return "UNKNOWN";
  const field = capabilityFieldByKind[kind];
  if (field) return capabilities.capabilities[field];
  if (statusByAuthKind[kind]) {
    if (kind === "AuthChallenge") {
      return capabilities.authModes.some((mode) => mode.toLowerCase() === "eimzo")
        ? "SUPPORTED"
        : "UNKNOWN";
    }
    return capabilities.authModes.length > 0 ? "SUPPORTED" : "UNKNOWN";
  }
  return "UNKNOWN";
};

export const hasSupportedCapability = (
  provider: EdoProviderDto | null | undefined,
  kind: EdoCapabilityKind,
  capabilities?: EdoCapabilitiesResponseDto | null,
) => Boolean(provider && capabilities && getCapabilityStatus(capabilities, kind) === "SUPPORTED");

export const getCategoryCapabilityStatus = (
  capabilities: EdoCapabilitiesResponseDto | null | undefined,
  category: string,
): EdoCapabilityStatus =>
  capabilities?.categoryCapabilities.find((item) => item.category === category)
    ?.capability ?? "UNKNOWN";

export const getStatusCapabilityStatus = (
  capabilities: EdoCapabilitiesResponseDto | null | undefined,
  status: string,
): EdoCapabilityStatus =>
  capabilities?.statusCapabilities.find((item) => item.status === status)
    ?.capability ?? "UNKNOWN";

export const isCapabilityAvailable = (status: EdoCapabilityStatus) =>
  status === "SUPPORTED";

const normalizeCapabilityKey = (value: string) =>
  value.replaceAll("_", "").toLocaleLowerCase();

const getScopeScore = (
  item: { direction?: EdoDocumentDirection | null; category: EdoDocumentCategory },
  direction: EdoDocumentDirection | undefined,
  category: EdoDocumentCategory,
) => {
  const categoryMatches = item.category === category;
  const categoryFallback = item.category === "ALL";
  const directionMatches = item.direction === direction;
  const directionFallback = item.direction == null;

  if (categoryMatches && directionMatches) return 4;
  if (categoryMatches && directionFallback) return 3;
  if (categoryFallback && directionMatches) return 2;
  if (categoryFallback && directionFallback) return 1;
  return -1;
};

export const getFilterCapabilityStatus = (
  capabilities: EdoCapabilitiesResponseDto | null | undefined,
  filter: EdoFilterCode,
  direction: EdoDocumentDirection | undefined,
  category: EdoDocumentCategory,
): EdoCapabilityStatus => {
  const filterKey = normalizeCapabilityKey(filter);
  const matches = (capabilities?.filterCapabilities ?? [])
    .filter(
      (item) => normalizeCapabilityKey(item.filter) === filterKey,
    )
    .map((item) => ({
      item,
      score: getScopeScore(item, direction, category),
    }))
    .filter(({ score }) => score >= 0)
    .sort((left, right) => right.score - left.score);

  return matches[0]?.item.capability ?? "UNKNOWN";
};

export const hasSupportedFilter = (
  capabilities: EdoCapabilitiesResponseDto | null | undefined,
  filter: EdoFilterCode,
  direction: EdoDocumentDirection | undefined,
  category: EdoDocumentCategory,
) =>
  getFilterCapabilityStatus(capabilities, filter, direction, category) ===
  "SUPPORTED";

export const getSupportedStatusOptions = (
  capabilities: EdoCapabilitiesResponseDto | null | undefined,
  direction: EdoDocumentDirection | undefined,
  category: EdoDocumentCategory,
) => {
  const bestByCode = new Map<
    EdoStatusOptionDto["code"],
    { item: EdoStatusOptionDto; score: number }
  >();

  for (const item of capabilities?.statusOptions ?? []) {
    if (item.capability !== "SUPPORTED") continue;
    const score = getScopeScore(item, direction, category);
    if (score < 0) continue;
    const current = bestByCode.get(item.code);
    if (!current || score > current.score) {
      bestByCode.set(item.code, { item, score });
    }
  }

  return [...bestByCode.values()].map(({ item }) => item);
};
