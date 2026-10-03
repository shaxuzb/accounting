import type { ContractTemplateKind } from "./constants";

export interface ContractTemplate {
  id: number;
  kind: ContractTemplateKind;
  name: string;
  fileName: string;
  version: number;
  isDefault: boolean;
  size: number;
  updatedDate: string;
}

export interface ContractTemplateKey {
  key: string;
  description: string;
  example: string;
}

export interface ContractTemplateKeyGroup {
  group: string;
  title: string;
  keys: ContractTemplateKey[];
}

export interface ContractTemplateSaved {
  id: number;
  unknownKeys: string[];
}

export interface ContractTemplateEditor {
  documentServerUrl: string;
  config: Record<string, unknown>;
}

/** Which document a contract is built from; the kind picks the templates offered. */
export type ContractDocumentKind = "purchase" | "sale" | "retail";

export interface ContractTemplateDocumentRenderPayload {
  documentType: ContractDocumentKind;
  documentId: number;
  format: "docx" | "pdf";
}
