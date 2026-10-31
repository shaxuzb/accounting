/** Only integrations that really work are listed; EDO signs in with its own session. */
/** ONEC: the 1C connector (an agent or a processing on the client's 1C computer pushes the base here). */
export type IntegrationCode = "EDO" | "ONEC";

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
