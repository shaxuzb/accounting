export const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const getArrayFromResponse = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!isObject(value)) return [];
  const candidates = ["entries", "items", "rows", "results", "data"];
  for (const key of candidates) {
    const current = value[key];
    if (Array.isArray(current)) return current;
  }
  return [];
};
