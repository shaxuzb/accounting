import type { EdoInboxQueryDto } from "../types/type";

export const edoQueryKeys = {
  all: ["settings", "integrations", "edo"] as const,
  activeProvider: () => [...edoQueryKeys.all, "active-provider"] as const,
  inboxes: () => [...edoQueryKeys.all, "inbox"] as const,
  inbox: (params: EdoInboxQueryDto) =>
    [...edoQueryKeys.inboxes(), params] as const,
  status: (direction: "INBOX" | "OUTBOX", id: string | number) =>
    [...edoQueryKeys.all, "status", direction, id] as const,
};
