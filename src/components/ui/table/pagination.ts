export interface PaginationRange {
  from: number;
  to: number;
}

export const getPaginationRange = (
  total: number,
  currentPage: number,
  pageSize: number,
): PaginationRange => {
  const normalizedTotal = Math.max(0, total);
  const normalizedPageSize = Math.max(1, pageSize);
  const pageCount = Math.max(
    1,
    Math.ceil(normalizedTotal / normalizedPageSize),
  );
  const safePage = Math.min(Math.max(1, currentPage), pageCount);

  if (normalizedTotal === 0) {
    return { from: 0, to: 0 };
  }

  const from = (safePage - 1) * normalizedPageSize + 1;
  return {
    from,
    to: Math.min(safePage * normalizedPageSize, normalizedTotal),
  };
};
