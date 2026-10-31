import type { IntegrationDefinition } from "../types/type";

// Telegram/Instagram/Email and the Asl Belgisi "connect" were placeholders (the connection was
// only kept in the browser); they come back here once the server really connects them.
export const integrationDefinitions: IntegrationDefinition[] = [
  {
    code: "EDO",
    nameKey: "settings.integrations.items.edo.name",
    descriptionKey: "settings.integrations.items.edo.description",
    domain: "DIDOX / EDOCS / FAKTURA",
    logoClassName: "bg-blue-600 text-white",
    logo: "EDO",
  },
  {
    code: "ONEC",
    nameKey: "settings.integrations.items.onec.name",
    descriptionKey: "settings.integrations.items.onec.description",
    domain: "1C:Enterprise 8.3",
    logoClassName: "bg-amber-400 text-red-700",
    logo: "1C",
  },
];
