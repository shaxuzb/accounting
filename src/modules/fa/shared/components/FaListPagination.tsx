import { Pagination } from "antd";
import { useSearchParams } from "react-router";

interface FaListPaginationProps {
  total?: number;
  page?: number;
  pageSize?: number;
}

export default function FaListPagination({
  total = 0,
  page,
  pageSize,
}: FaListPaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = page ?? Number(searchParams.get("page") || 1);
  const size = pageSize ?? Number(searchParams.get("pageSize") || 20);

  if (total <= size && current === 1) return null;

  return (
    <div className="flex justify-end border-t border-border px-4 py-3">
      <Pagination
        current={current}
        pageSize={size}
        total={total}
        showSizeChanger
        pageSizeOptions={[10, 20, 50, 100]}
        onChange={(nextPage, nextPageSize) => {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.set("page", String(nextPageSize === size ? nextPage : 1));
          nextParams.set("pageSize", String(nextPageSize));
          setSearchParams(nextParams, { replace: true });
        }}
      />
    </div>
  );
}
