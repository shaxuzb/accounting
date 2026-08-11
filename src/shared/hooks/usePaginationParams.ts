import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

const DEFAULT_PAGE_SIZE = 20;

const getPositiveInteger = (value: string | null, fallback: number) => {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

/**
 * Ro'yxat sahifalari uchun URL asosidagi pagination.
 * Antd Table pagination propsini tayyor holda qaytaradi.
 */
export const usePaginationParams = (defaultPageSize = DEFAULT_PAGE_SIZE) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = getPositiveInteger(searchParams.get("page"), 1);
  const pageSize = getPositiveInteger(
    searchParams.get("pageSize"),
    defaultPageSize,
  );

  const queryParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    return params;
  }, [page, pageSize, searchParams]);

  const handleChange = useCallback(
    (nextPage: number, nextPageSize: number) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("page", String(nextPageSize === pageSize ? nextPage : 1));
      nextParams.set("pageSize", String(nextPageSize));
      setSearchParams(nextParams, { replace: true });
    },
    [pageSize, searchParams, setSearchParams],
  );

  /** Sahifadagi qatorlarga umumiy tartib raqamini qo'yadi. */
  const withRowNumbers = useCallback(
    <T extends object>(items?: T[]) =>
      (items ?? []).map((item, index) => ({
        ...item,
        key: (item as { id?: number | string }).id ?? index,
        indexId: (page - 1) * pageSize + index + 1,
      })),
    [page, pageSize],
  );

  const paginationProps = useCallback(
    (total?: number) => ({
      current: page,
      pageSize,
      total: total ?? 0,
      showSizeChanger: true,
      pageSizeOptions: [10, 20, 50, 100],
      showTotal: (totalCount: number, range: [number, number]) =>
        t("common.resultRange", {
          from: range[0],
          to: range[1],
          total: totalCount,
        }),
      onChange: handleChange,
    }),
    [handleChange, page, pageSize, t],
  );

  return useMemo(
    () => ({ page, pageSize, queryParams, withRowNumbers, paginationProps }),
    [page, pageSize, paginationProps, queryParams, withRowNumbers],
  );
};
