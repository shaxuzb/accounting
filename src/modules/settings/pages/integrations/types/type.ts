export type IntegrationCode =
  | "DDOCS"
  | "ASL_BELGISI"
  | "TELEGRAM"
  | "INSTAGRAM"
  | "EMAIL";

export type IntegrationCategory =
  | "ALL"
  | "DOCUMENTS"
  | "COMMUNICATION"
  | "MARKING";

export type IntegrationStatus =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "ERROR";

export interface CertificateMetadata {
  serialNumber: string;
  ownerName: string;
  commonName: string;
  tin?: string;
  pinfl?: string;
  validTo: string;
}

export interface IntegrationRecord {
  code: IntegrationCode;
  status: IntegrationStatus;
  certificate?: CertificateMetadata;
  connectedAt?: string;
  error?: string;
}

export interface IntegrationDefinition {
  code: IntegrationCode;
  category: Exclude<IntegrationCategory, "ALL">;
  nameKey: string;
  descriptionKey: string;
  domain: string;
  accentClassName: string;
  logoClassName: string;
  logo: string;
  isAvailable: boolean;
}

export interface IntegrationSignPayload {
  version: 1;
  action: "CONNECT_INTEGRATION";
  integration: IntegrationCode;
  nonce: string;
  timestamp: string;
}

export interface IntegrationConnectionRequest {
  certificate: CertificateMetadata;
  signature: string;
}

export interface IntegrationService {
  list: () => Promise<IntegrationRecord[]>;
  challenge: (code: IntegrationCode) => Promise<IntegrationSignPayload>;
  connect: (
    code: IntegrationCode,
    request: IntegrationConnectionRequest,
  ) => Promise<IntegrationRecord>;
  disconnect: (code: IntegrationCode) => Promise<void>;
}
