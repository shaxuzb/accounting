export const faDocumentStatusIds = {
  draft: 1,
  posted: 2,
  cancelled: 3,
} as const;

interface FaStatusCarrier {
  statusId?: number | string | null;
  statusCode?: string | null;
  statusName?: string | null;
  stateId?: number | string | null;
  stateCode?: string | null;
  stateName?: string | null;
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
  if (statusName) return draftStatusNames.has(statusName);

  const stateCode = normalizeStatusText(record.stateCode);
  if (stateCode) return stateCode === "draft";

  if (record.stateId != null) {
    return Number(record.stateId) === faDocumentStatusIds.draft;
  }

  return draftStatusNames.has(normalizeStatusText(record.stateName));
};
