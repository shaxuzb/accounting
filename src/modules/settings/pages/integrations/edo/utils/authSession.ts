import type { EdoAuthCompleteDto, EdoProviderCode } from "../types/type";

const storageKey = (providerCode: EdoProviderCode) =>
  `accounting:edo:auth:${providerCode}`;

export const readEdoAuthSession = (providerCode?: EdoProviderCode) => {
  if (!providerCode) return null;
  try {
    const raw = sessionStorage.getItem(storageKey(providerCode));
    if (!raw) return null;
    const session = JSON.parse(raw) as EdoAuthCompleteDto;
    if (session.expiresAt && new Date(session.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(storageKey(providerCode));
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const saveEdoAuthSession = (
  providerCode: EdoProviderCode,
  session: EdoAuthCompleteDto,
) => sessionStorage.setItem(storageKey(providerCode), JSON.stringify(session));
