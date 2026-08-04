const storagePrefix = "accounting:edo:idempotency";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getOrCreateIdempotencyKey = (operationKey: string) => {
  const key = `${storagePrefix}:${operationKey}`;
  const stored = sessionStorage.getItem(key);
  if (stored) return stored;

  const value = createId();
  sessionStorage.setItem(key, value);
  return value;
};

export const clearIdempotencyKey = (operationKey: string) => {
  sessionStorage.removeItem(`${storagePrefix}:${operationKey}`);
};
