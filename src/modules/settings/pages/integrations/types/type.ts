/** Only integrations that really work are listed; EDO signs in with its own session. */
export type IntegrationCode = "EDO";

export type IntegrationStatus =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "ERROR";

export interface IntegrationRecord {
  code: IntegrationCode;
  status: IntegrationStatus;
}

export interface IntegrationDefinition {
  code: IntegrationCode;
  nameKey: string;
  descriptionKey: string;
  domain: string;
  logoClassName: string;
  logo: string;
}
