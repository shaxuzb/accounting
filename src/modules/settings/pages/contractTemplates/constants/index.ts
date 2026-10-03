export const contractTemplatePermissions = {
  view: "CONTRACT_TEMPLATE_VIEW",
  create: "CONTRACT_TEMPLATE_CREATE",
  update: "CONTRACT_TEMPLATE_UPDATE",
  delete: "CONTRACT_TEMPLATE_DELETE",
} as const;

export const contractTemplateEndpoints = {
  list: "contract-templates",
  keys: "contract-templates/keys",
  item: (id: number | string) => `contract-templates/${id}`,
  file: (id: number | string) => `contract-templates/${id}/file`,
  unknownKeys: (id: number | string) => `contract-templates/${id}/unknown-keys`,
  editor: (id: number | string) => `contract-templates/${id}/editor`,
  editorSave: (id: number | string) => `contract-templates/${id}/editor/save`,
  editorDiscard: (id: number | string) => `contract-templates/${id}/editor/discard`,
  renderDocument: (id: number | string) => `contract-templates/${id}/render-document`,
  preview: (id: number | string) => `contract-templates/${id}/preview`,
} as const;

export const contractTemplateKeys = {
  all: ["contract-templates"] as const,
  list: (params?: unknown) => ["contract-templates", "list", params] as const,
  keys: ["contract-templates", "keys"] as const,
  editor: (id: number | string) => ["contract-templates", "editor", id] as const,
  preview: (id: number, version: number) =>
    ["contract-templates", "preview", id, version] as const,
  documentPreview: (templateId: number, version: number, kind: string, documentId: number) =>
    ["contract-templates", "document-preview", templateId, version, kind, documentId] as const,
};

export const contractTemplateKinds = [
  "purchase",
  "sale",
  "retail",
  "service",
  "rental",
  "other",
] as const;

export type ContractTemplateKind = (typeof contractTemplateKinds)[number];
