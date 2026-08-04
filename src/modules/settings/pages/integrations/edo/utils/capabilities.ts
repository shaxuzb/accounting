import type { EdoCapabilityKind, EdoProviderDto } from "../types/type";

export const hasSupportedCapability = (
  provider: EdoProviderDto | null | undefined,
  kind: EdoCapabilityKind,
) => Boolean(provider && supportedCapabilities.has(kind));

export const getCapabilityStatus = (
  provider: EdoProviderDto | null | undefined,
  kind: EdoCapabilityKind,
) => (provider && supportedCapabilities.has(kind) ? "SUPPORTED" : "UNKNOWN");

const supportedCapabilities = new Set<EdoCapabilityKind>([
  "AuthChallenge",
  "AuthComplete",
  "CreateFactura",
  "SignOutbox",
  "ListInbox",
  "RejectInbox",
  "GetFile",
  "GetOutboxStatus",
  "GetInboxStatus",
]);
