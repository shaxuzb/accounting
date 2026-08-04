import type { EdoProviderCode } from "../types/type";

export interface EdoProviderOption {
  providerCode: EdoProviderCode;
  displayName: string;
}

export const edoProviderOptions: EdoProviderOption[] = [
  { providerCode: "FAKTURA", displayName: "Faktura" },
  { providerCode: "EDOCS", displayName: "EDOCS" },
  { providerCode: "DIDOX", displayName: "Didox" },
];
