import type { ReactNode } from "react";
import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { Alert, Button, Empty, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import ListPagination from "@/components/ui/table/ListPagination";
import type { OperationalReportKey } from "../constants/permissions";
import { useOperationalReportList } from "../hooks";
import ReportExportButton from "./ReportExportButton";

interface ReportListPageProps<T> {
  report: OperationalReportKey;
  exportPermission: string;
  columns: TableColumnsType<T & { indexId: number }>;
  filters?: ReactNode;
  /**
   * URL'ga chiqmaydigan, lekin har doim so'rovga qo'shiladigan filterlar —
   * masalan debitor hisoboti uchun `documentTypeId`.
   */
  fixedParams?: Record<string, string | number>;
  /** Jadval ustidagi qisqa xulosa (jami summa va h.k.). */
  summary?: (rows: T[], totalCount: number) => ReactNode;
  emptyTextKey?: string;
}

const toPositiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Yettita operativ hisobot bir xil shaklda ishlaydi: filtr URL'da turadi,
 * backend `PagedResponse` qaytaradi, eksport esa o'sha filtrni faylga yozadi.
 * Shuning uchun umumiy qobiq bitta joyda saqlanadi — sahifalar faqat o'z
 * ustunlari va filterlarini beradi.
 */
export default function ReportListPage<T extends { id: number }>({
  report,
  exportPermission,
  columns,
  filters,
  fixedParams,
  summary,
  emptyTextKey = "reports.messages.empty",
}: ReportListPageProps<T>) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // fixedParams sahifada literal sifatida beriladi va har renderda yangi obyekt
  // bo'lib keladi, shuning uchun uni tarkibi bo'yicha solishtiramiz — aks holda
  // so'rov o'zgarmagan holda ham qayta yuborilaveradi.
  const fixedParamsKey = JSON.stringify(fixedParams ?? {});

  const requestParams = useMemo(
    () => ({
      ...Object.fromEntries(searchParams),
      ...(JSON.parse(fixedParamsKey) as Record<string, string | number>),
    }),
    [searchParams, fixedParamsKey],
  );

  const { data, isError, isLoading, isFetching, refetch } =
    useOperationalReportList<T>(report, requestParams);

  const rows = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const currentPage = toPositiveInteger(
    searchParams.get("page"),
    data?.page ?? 1,
  );
  const pageSize = toPositiveInteger(
    searchParams.get("pageSize"),
    data?.pageSize ?? 20,
  );

  const tableData = rows.map((item, index) => ({
    ...item,
    indexId: (currentPage - 1) * pageSize + index + 1,
  }));

  const handlePaginationChange = (page: number, nextPageSize: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPageSize === pageSize ? page : 1));
    nextParams.set("pageSize", String(nextPageSize));
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="w-full">
      <ListToolbar
        filters={filters}
        actions={
          <ReportExportButton
            report={report}
            permission={exportPermission}
            params={requestParams}
            disabled={totalCount === 0}
          />
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />

      {summary?.(rows, totalCount)}

      <Card className="overflow-hidden border border-border">
        {isError && (
          <Alert
            showIcon
            type="error"
            className="m-3"
            message={t("reports.messages.loadError")}
            action={
              <Button size="small" onClick={() => void refetch()}>
                {t("reports.actions.retry")}
              </Button>
            }
          />
        )}
        <Table
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t(emptyTextKey)}
              />
            ),
          }}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 320px)" }}
        />
        <ListPagination
          current={currentPage}
          pageSize={pageSize}
          total={totalCount}
          onChange={handlePaginationChange}
        />
      </Card>
    </div>
  );
}
