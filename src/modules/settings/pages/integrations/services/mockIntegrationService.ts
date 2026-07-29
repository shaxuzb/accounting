import {
  integrationDefinitions,
  integrationsStorageKey,
} from "../constants/integration";
import type {
  IntegrationCode,
  IntegrationConnectionRequest,
  IntegrationRecord,
  IntegrationService,
} from "../types/type";

const defaultRecords: IntegrationRecord[] = integrationDefinitions.map(
  ({ code }) => ({ code, status: "DISCONNECTED" }),
);

function readRecords(): IntegrationRecord[] {
  try {
    const stored = localStorage.getItem(integrationsStorageKey);
    if (!stored) return defaultRecords;

    const parsed = JSON.parse(stored) as IntegrationRecord[];
    const storedByCode = new Map(parsed.map((item) => [item.code, item]));
    return defaultRecords.map((item) => storedByCode.get(item.code) ?? item);
  } catch {
    return defaultRecords;
  }
}

function writeRecords(records: IntegrationRecord[]) {
  localStorage.setItem(integrationsStorageKey, JSON.stringify(records));
}

function createNonce() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const mockIntegrationService: IntegrationService = {
  async list() {
    return readRecords();
  },

  async challenge(code) {
    return {
      version: 1,
      action: "CONNECT_INTEGRATION",
      integration: code,
      nonce: createNonce(),
      timestamp: new Date().toISOString(),
    };
  },

  async connect(code, request: IntegrationConnectionRequest) {
    const record: IntegrationRecord = {
      code,
      status: "CONNECTED",
      certificate: request.certificate,
      connectedAt: new Date().toISOString(),
    };
    const records = readRecords().map((item) =>
      item.code === code ? record : item,
    );
    writeRecords(records);
    return record;
  },

  async disconnect(code: IntegrationCode) {
    writeRecords(
      readRecords().map((item) =>
        item.code === code ? { code, status: "DISCONNECTED" } : item,
      ),
    );
  },
};
