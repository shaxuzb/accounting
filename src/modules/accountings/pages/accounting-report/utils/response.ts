export const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const addSectionRowMeta = (
  section: Record<string, unknown>,
  row: unknown,
): Record<string, unknown> => {
  const rawRow = isObject(row) ? row : { value: row };
  const sectionMeta = {
    sectionCode: section.code ?? null,
    sectionName: section.name ?? null,
    sectionType: section.type ?? null,
    sectionTotal:
      section.total ?? section.inflow ?? section.outflow ?? section.net ?? null,
  };

  return {
    ...rawRow,
    ...Object.fromEntries(
      Object.entries(sectionMeta).filter(([, value]) => value !== undefined),
    ),
  };
};

const getArrayFromResponseInternal = (
  value: unknown,
  visited: Set<object>,
): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!isObject(value)) return [];
  if (visited.has(value)) return [];

  visited.add(value);

  const candidates = [
    "entries",
    "items",
    "rows",
    "results",
    "data",
    "payload",
    "result",
    "report",
    "reports",
    "lines",
    "content",
  ];
  const objectValue = value as Record<string, unknown>;

  if (Array.isArray(objectValue.sections)) {
    const sectionRows: unknown[] = [];

    for (const section of objectValue.sections) {
      if (!isObject(section)) continue;

      if (Array.isArray(section.rows)) {
        for (const row of section.rows) {
          sectionRows.push(addSectionRowMeta(section, row));
        }
        continue;
      }

      sectionRows.push(...getArrayFromResponseInternal(section, visited));
    }

    if (sectionRows.length > 0) return sectionRows;
  }

  for (const key of candidates) {
    const current = objectValue[key];
    if (Array.isArray(current)) return current;
    if (isObject(current)) {
      const nested = getArrayFromResponseInternal(current, visited);
      if (nested.length) return nested;
    }
  }

  for (const [key, current] of Object.entries(objectValue)) {
    if (key === "sections") continue;
    if (Array.isArray(current)) return current;
    if (isObject(current)) {
      const nested = getArrayFromResponseInternal(current, visited);
      if (nested.length) return nested;
    }
  }

  const fallbackRow: Record<string, unknown> = {};
  for (const [key, candidate] of Object.entries(objectValue)) {
    if (!Array.isArray(candidate)) {
      fallbackRow[key] = candidate;
    }
  }

  return Object.keys(fallbackRow).length ? [fallbackRow] : [];
};

export const getArrayFromResponse = (value: unknown): unknown[] => {
  return getArrayFromResponseInternal(value, new Set<object>());
};
