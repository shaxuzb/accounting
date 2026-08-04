import type {
  IntegrationCategory,
  IntegrationDefinition,
  IntegrationCode,
} from "../types/type";

export const integrationDefinitions: IntegrationDefinition[] = [
  {
    code: "EDO",
    category: "DOCUMENTS",
    nameKey: "settings.integrations.items.edo.name",
    descriptionKey: "settings.integrations.items.edo.description",
    domain: "DIDOX / EDOCS / FAKTURA",
    accentClassName: "bg-blue-50 text-blue-600",
    logoClassName: "bg-blue-600 text-white",
    logo: "EDO",
    isAvailable: true,
  },
  {
    code: "ASL_BELGISI",
    category: "MARKING",
    nameKey: "settings.integrations.items.aslBelgi.name",
    descriptionKey: "settings.integrations.items.aslBelgi.description",
    domain: "aslbelgisi",
    accentClassName: "bg-emerald-50 text-emerald-600",
    logoClassName: "bg-emerald-600 text-white",
    logo: "AB",
    isAvailable: true,
  },
  {
    code: "TELEGRAM",
    category: "COMMUNICATION",
    nameKey: "settings.integrations.items.telegram.name",
    descriptionKey: "settings.integrations.items.telegram.description",
    domain: "telegram.org",
    accentClassName: "bg-sky-50 text-sky-600",
    logoClassName: "bg-sky-500 text-white",
    logo: "TG",
    isAvailable: false,
  },
  {
    code: "INSTAGRAM",
    category: "COMMUNICATION",
    nameKey: "settings.integrations.items.instagram.name",
    descriptionKey: "settings.integrations.items.instagram.description",
    domain: "instagram.com",
    accentClassName: "bg-rose-50 text-rose-600",
    logoClassName: "bg-linear-to-br from-fuchsia-600 to-orange-400 text-white",
    logo: "IG",
    isAvailable: false,
  },
  {
    code: "EMAIL",
    category: "COMMUNICATION",
    nameKey: "settings.integrations.items.email.name",
    descriptionKey: "settings.integrations.items.email.description",
    domain: "SMTP / IMAP",
    accentClassName: "bg-amber-50 text-amber-700",
    logoClassName: "bg-amber-500 text-white",
    logo: "@",
    isAvailable: false,
  },
];

export const integrationCategories: {
  value: IntegrationCategory;
  labelKey: string;
}[] = [
  { value: "ALL", labelKey: "settings.integrations.filters.all" },
  { value: "DOCUMENTS", labelKey: "settings.integrations.filters.documents" },
  { value: "COMMUNICATION", labelKey: "settings.integrations.filters.communication" },
  { value: "MARKING", labelKey: "settings.integrations.filters.marking" },
];

export const integrationNames: Record<IntegrationCode, string> = {
  EDO: "EDO",
  ASL_BELGISI: "Asl Belgisi",
  TELEGRAM: "Telegram",
  INSTAGRAM: "Instagram",
  EMAIL: "Email",
};

export const integrationsStorageKey = "settings.integrations.v1";
