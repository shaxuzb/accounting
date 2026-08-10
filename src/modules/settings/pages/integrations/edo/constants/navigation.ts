import type { EdoDocumentDirection } from "../types/type";

export type EdoWorkspaceSection = "INBOX" | "OUTBOX" | "DRAFTS" | "ALL";

export interface EdoNavigationDefinition {
  id: EdoWorkspaceSection;
  labelKey: string;
  direction?: EdoDocumentDirection;
}

export interface EdoNavigationItem extends EdoNavigationDefinition {
  available: boolean;
}

const navigationDefinitions: EdoNavigationDefinition[] = [
  {
    id: "INBOX",
    labelKey: "settings.integrations.edo.navigation.inbox",
    direction: "INBOX",
  },
  {
    id: "OUTBOX",
    labelKey: "settings.integrations.edo.navigation.outbox",
    direction: "OUTBOX",
  },
  {
    id: "DRAFTS",
    labelKey: "settings.integrations.edo.navigation.drafts",
    direction: "OUTBOX",
  },
  {
    id: "ALL",
    labelKey: "settings.integrations.edo.navigation.all",
  },
];

export const getEdoNavigation = () => navigationDefinitions;

export const getEdoNavigationItem = (section: EdoWorkspaceSection) =>
  navigationDefinitions.find((item) => item.id === section);
