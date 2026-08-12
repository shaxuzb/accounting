export const faDocumentStatusIds = {
  draft: 1,
  posted: 2,
  cancelled: 3,
  pending: 4,
} as const;

export const faAssetStatusIds = {
  notCommissioned: 1,
  active: 2,
  conservation: 3,
  disposed: 4,
} as const;

export const faRecordStateIds = {
  active: 1,
  passive: 2,
} as const;

interface FaStatusCarrier {
  statusId?: number | string | null;
  statusCode?: string | null;
  statusName?: string | null;
}

const draftStatusNames = new Set([
  "draft",
  "qoralama",
  "черновик",
]);

const normalizeStatusText = (value?: string | null) =>
  String(value ?? "").trim().toLocaleLowerCase();

export const isFaDraftStatus = (record: FaStatusCarrier) => {
  const statusCode = normalizeStatusText(record.statusCode);
  if (statusCode) return statusCode === "draft";

  if (record.statusId != null) {
    return Number(record.statusId) === faDocumentStatusIds.draft;
  }

  const statusName = normalizeStatusText(record.statusName);
  return draftStatusNames.has(statusName);
};
