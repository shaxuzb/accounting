export type PersistStorage = "local" | "session";

const getStorage = (storage: PersistStorage): Storage | null => {
  if (typeof window === "undefined") return null;

  try {
    return storage === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

export const readPersistedValue = <T>(
  key: string,
  fallback: T,
  storage: PersistStorage = "session",
): T => {
  const target = getStorage(storage);
  if (!target) return fallback;

  try {
    const raw = target.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
};

export const writePersistedValue = <T>(
  key: string,
  value: T,
  storage: PersistStorage = "session",
) => {
  const target = getStorage(storage);
  if (!target) return;

  try {
    target.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable or full. Persistence must never break the UI.
  }
};

export const removePersistedValue = (
  key: string,
  storage: PersistStorage = "session",
) => {
  const target = getStorage(storage);
  if (!target) return;

  try {
    target.removeItem(key);
  } catch {
    // Ignore storage access errors.
  }
};

export const scopedStorageKey = (
  namespace: string,
  userId: string | number | null | undefined,
  organizationId: string | number | null | undefined,
  scope: string,
) =>
  `accounting:${namespace}:${userId || "anonymous"}:${organizationId || "default"}:${scope}`;
