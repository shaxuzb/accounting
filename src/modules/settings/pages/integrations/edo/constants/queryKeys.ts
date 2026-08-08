import type {
  EdoAllDocumentsQueryDto,
  EdoInboxQueryDto,
  EdoOutboxQueryDto,
} from "../types/type";

export const edoQueryKeys = {
  all: ["settings", "integrations", "edo"] as const,
  activeProvider: () => [...edoQueryKeys.all, "active-provider"] as const,
  capabilities: (providerCode?: string) =>
    [...edoQueryKeys.all, "capabilities", providerCode ?? "none"] as const,
  inboxes: () => [...edoQueryKeys.all, "inbox"] as const,
  inbox: (params: EdoInboxQueryDto) =>
    [...edoQueryKeys.inboxes(), params] as const,
  outboxes: () => [...edoQueryKeys.all, "outbox"] as const,
  outbox: (params: EdoOutboxQueryDto) =>
    [...edoQueryKeys.outboxes(), params] as const,
  allDocuments: (params: EdoAllDocumentsQueryDto) =>
    [...edoQueryKeys.all, "documents", "all", params] as const,
  document: (id: string | number) =>
    [...edoQueryKeys.all, "document", id] as const,
  summary: () => [...edoQueryKeys.all, "summary"] as const,
  remoteOutboxStatus: (providerDocumentId?: string) =>
    [...edoQueryKeys.all, "remote-outbox-status", providerDocumentId ?? "none"] as const,
  status: (direction: "INBOX" | "OUTBOX", id: string | number) =>
    [...edoQueryKeys.all, "status", direction, id] as const,
  file: (id: string | number) => [...edoQueryKeys.all, "file", id] as const,
};
