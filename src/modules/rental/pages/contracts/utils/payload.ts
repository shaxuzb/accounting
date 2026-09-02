type UnknownRecord = Record<string, unknown>;

interface BuildContractPayloadOptions {
  includeObjectIds?: boolean;
}

export const buildContractPayload = (
  values: UnknownRecord,
  { includeObjectIds = true }: BuildContractPayloadOptions = {},
): UnknownRecord => {
  const {
    id: _id,
    organizationId: _organizationId,
    statusId: _statusId,
    statusName: _statusName,
    createdDate: _createdDate,
    postedAt: _postedAt,
    cancelledAt: _cancelledAt,
    objects,
    ...payload
  } = values;

  return {
    ...payload,
    objects: Array.isArray(objects)
      ? objects.map((item) => {
          const {
            id,
            nextAccrualDate: _nextAccrualDate,
            ...objectPayload
          } = item as UnknownRecord;
          return includeObjectIds && id !== undefined
            ? { ...objectPayload, id }
            : objectPayload;
        })
      : [],
  };
};
