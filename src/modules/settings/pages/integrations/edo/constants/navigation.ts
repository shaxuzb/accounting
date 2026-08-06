import type { EdoDocumentStatusCode, EdoProviderCode } from "../types/type";

export type EdoWorkspaceSection =
  | "INBOX"
  | "OUTBOX"
  | "DRAFTS"
  | "TEMPLATES"
  | "EXCEL";

export interface EdoStatusFilterOption {
  value: EdoDocumentStatusCode;
  labelKey: string;
}

export interface EdoNavigationItem {
  id: EdoWorkspaceSection;
  labelKey: string;
  direction?: "INBOX" | "OUTBOX";
  available: boolean;
  statusOptions: EdoStatusFilterOption[];
}

const didoxInboxStatuses: EdoStatusFilterOption[] = [
  {
    value: "RECEIVED",
    labelKey: "settings.integrations.edo.navigation.received",
  },
  {
    value: "SIGNED",
    labelKey: "settings.integrations.edo.navigation.signed",
  },
  {
    value: "REJECTED",
    labelKey: "settings.integrations.edo.navigation.rejected",
  },
];

const didoxOutboxStatuses: EdoStatusFilterOption[] = [
  {
    value: "PENDING",
    labelKey: "settings.integrations.edo.navigation.pendingPartnerSignature",
  },
  {
    value: "SIGNED",
    labelKey: "settings.integrations.edo.navigation.signed",
  },
  {
    value: "REJECTED",
    labelKey: "settings.integrations.edo.navigation.rejected",
  },
  {
    value: "CANCELLED",
    labelKey: "settings.integrations.edo.navigation.deleted",
  },
];

const edocsInboxStatuses: EdoStatusFilterOption[] = [
  {
    value: "PENDING",
    labelKey: "settings.integrations.edo.navigation.pendingSignature",
  },
  {
    value: "SIGNED",
    labelKey: "settings.integrations.edo.navigation.signed",
  },
  {
    value: "REJECTED",
    labelKey: "settings.integrations.edo.navigation.rejected",
  },
  {
    value: "CANCELLED",
    labelKey: "settings.integrations.edo.navigation.deleted",
  },
];

const edocsOutboxStatuses = edocsInboxStatuses;

const navigationByProvider: Record<EdoProviderCode, EdoNavigationItem[]> = {
  DIDOX: [
    {
      id: "INBOX",
      labelKey: "settings.integrations.edo.navigation.inbox",
      direction: "INBOX",
      available: true,
      statusOptions: didoxInboxStatuses,
    },
    {
      id: "OUTBOX",
      labelKey: "settings.integrations.edo.navigation.outbox",
      direction: "OUTBOX",
      available: false,
      statusOptions: didoxOutboxStatuses,
    },
    {
      id: "DRAFTS",
      labelKey: "settings.integrations.edo.navigation.drafts",
      available: false,
      statusOptions: [],
    },
    {
      id: "TEMPLATES",
      labelKey: "settings.integrations.edo.navigation.templates",
      available: false,
      statusOptions: [],
    },
    {
      id: "EXCEL",
      labelKey: "settings.integrations.edo.navigation.excelImport",
      available: false,
      statusOptions: [],
    },
  ],
  EDOCS: [
    {
      id: "INBOX",
      labelKey: "settings.integrations.edo.navigation.inbox",
      direction: "INBOX",
      available: true,
      statusOptions: edocsInboxStatuses,
    },
    {
      id: "OUTBOX",
      labelKey: "settings.integrations.edo.navigation.outbox",
      direction: "OUTBOX",
      available: false,
      statusOptions: edocsOutboxStatuses,
    },
  ],
  FAKTURA: [
    {
      id: "INBOX",
      labelKey: "settings.integrations.edo.navigation.inbox",
      direction: "INBOX",
      available: true,
      statusOptions: edocsInboxStatuses,
    },
    {
      id: "OUTBOX",
      labelKey: "settings.integrations.edo.navigation.outbox",
      direction: "OUTBOX",
      available: false,
      statusOptions: edocsOutboxStatuses,
    },
  ],
};

export const getEdoNavigation = (providerCode?: EdoProviderCode) =>
  providerCode ? navigationByProvider[providerCode] : [];

export const getEdoNavigationItem = (
  providerCode: EdoProviderCode | undefined,
  section: EdoWorkspaceSection,
) => getEdoNavigation(providerCode).find((item) => item.id === section);
