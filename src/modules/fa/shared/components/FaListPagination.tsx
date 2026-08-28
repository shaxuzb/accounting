import { useSearchParams } from "react-router";
import ListPagination from "@/components/ui/table/ListPagination";

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

  return (
    <ListPagination
      current={current}
      pageSize={size}
      total={total}
      onChange={(nextPage, nextPageSize) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("page", String(nextPageSize === size ? nextPage : 1));
        nextParams.set("pageSize", String(nextPageSize));
        setSearchParams(nextParams, { replace: true });
      }}
    />
  );
}
