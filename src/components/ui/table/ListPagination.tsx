import { Pagination } from "antd";
import type { PaginationProps } from "antd";
import { useTranslation } from "react-i18next";
import { getPaginationRange } from "./pagination";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function ListPagination({
  current = 1,
  pageSize = 20,
  total = 0,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onChange,
  showTotal: _showTotal,
  className,
  ...paginationProps
}: PaginationProps) {
  const { t } = useTranslation();
  const range = getPaginationRange(total, current, pageSize);

  return (
    <div className="flex w-full flex-col items-start justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
      <span className="text-sm text-secondary-text">
        {t("common.resultRange", {
          from: range.from,
          to: range.to,
          total,
        })}
      </span>
      <Pagination
        {...paginationProps}
        showTotal={undefined}
        className={className ? `${className} m-0!` : "m-0!"}
        current={current}
        pageSize={pageSize}
        total={total}
        showSizeChanger
        pageSizeOptions={pageSizeOptions}
        onChange={onChange}
      />
    </div>
  );
}
