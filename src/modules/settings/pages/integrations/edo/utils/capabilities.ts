import type {
  EdoCapabilitiesResponseDto,
  EdoCapabilityKind,
  EdoCapabilityStatus,
  EdoProviderDto,
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
  status === "SUPPORTED" || status === "PARTIAL";
