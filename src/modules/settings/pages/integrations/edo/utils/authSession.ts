import type { EdoAuthCompleteDto, EdoProviderCode } from "../types/type";

const storagePrefix = "accounting:edo:auth:v1";

export const edoAuthSessionChangedEvent = "accounting:edo-auth-session-changed";

const getScope = () => {
  let userId = 0;
  let organizationId = 0;

  try {
    const login = JSON.parse(localStorage.getItem("login") ?? "null") as {
      user?: { id?: number; organizationId?: number };
    } | null;
    const organization = JSON.parse(localStorage.getItem("org") ?? "null") as {
      id?: number;
    } | null;

    userId = login?.user?.id ?? 0;
    organizationId = organization?.id ?? login?.user?.organizationId ?? 0;
  } catch {
    // Invalid persisted auth data is handled by the auth store.
  }

  return `${userId}:${organizationId}`;
};

const storageKey = () => `${storagePrefix}:${getScope()}`;

interface PersistedEdoAuthSession extends EdoAuthCompleteDto {
  providerCode: EdoProviderCode;
}

const notifyChanged = (providerCode?: EdoProviderCode) =>
  window.dispatchEvent(
    new CustomEvent(edoAuthSessionChangedEvent, { detail: { providerCode } }),
  );

export const isEdoAuthSessionActive = (
  session: EdoAuthCompleteDto | null | undefined,
) =>
  Boolean(
    session?.isAuthenticated &&
      (!session.expiresAt || new Date(session.expiresAt).getTime() > Date.now()),
  );

export const readEdoAuthSession = (providerCode?: EdoProviderCode) => {
  if (!providerCode) return null;
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return null;
    const stored = JSON.parse(raw) as PersistedEdoAuthSession;
    if (stored.providerCode !== providerCode) return null;
    if (!isEdoAuthSessionActive(stored)) {
      localStorage.removeItem(storageKey());
      return null;
    }
    return stored;
  } catch {
    localStorage.removeItem(storageKey());
    return null;
  }
};

export const saveEdoAuthSession = (
  providerCode: EdoProviderCode,
  session: EdoAuthCompleteDto,
) => {
  const persisted: PersistedEdoAuthSession = {
    isAuthenticated: session.isAuthenticated,
    expiresAt: session.expiresAt,
    providerCode,
  };
  localStorage.setItem(storageKey(), JSON.stringify(persisted));
  notifyChanged(providerCode);
};

export const clearEdoAuthSession = (providerCode: EdoProviderCode) => {
  const current = readEdoAuthSession(providerCode);
  if (current) localStorage.removeItem(storageKey());
  notifyChanged(providerCode);
};

export const clearCurrentEdoAuthSessions = () => {
  localStorage.removeItem(storageKey());
  notifyChanged();
};
