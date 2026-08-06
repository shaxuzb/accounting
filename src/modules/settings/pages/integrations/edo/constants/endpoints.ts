export const edoEndpoints = {
  activeProvider: "/edo/active-provider",
  authChallenge: "/edo/auth/challenge",
  authComplete: "/edo/auth/complete",
  fakturaAuthComplete: "/edo/auth/faktura/complete",
  outboxFacturas: "/edo/outbox/facturas",
  outboxSign: (id: string | number) => `/edo/outbox/${id}/sign`,
  inbox: "/edo/inbox",
  inboxReject: (id: string | number) => `/edo/inbox/${id}/reject`,
  file: (id: string | number) => `/edo/files/${id}`,
  outboxStatus: (id: string | number) => `/edo/outbox/${id}/status`,
  inboxStatus: (id: string | number) => `/edo/inbox/${id}/status`,
} as const;
