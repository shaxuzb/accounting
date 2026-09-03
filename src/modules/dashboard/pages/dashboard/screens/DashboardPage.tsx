import { Alert, Button, Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import DashboardHeader from "../../../components/DashboardHeader";
import CashSummaryWidget from "../../../components/CashSummaryWidget";
import ElectronicDocumentsWidget from "../../../components/ElectronicDocumentsWidget";
import ReceivablesPayablesWidget from "../../../components/ReceivablesPayablesWidget";
import RelationshipsWidget from "../../../components/RelationshipsWidget";
import TaxSummaryWidget from "../../../components/TaxSummaryWidget";
import UnavailableWidget from "../../../components/UnavailableWidget";
import { useDashboard } from "../../../hooks/useDashboard";

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-label="Dashboard loading" role="status">
      {["header", "cash", "health", "documents"].map((key) => (
        <div
          key={key}
          className="rounded-2xl border border-border bg-(--theme-bg-card) p-5"
        >
          <Skeleton active paragraph={{ rows: key === "cash" ? 5 : 2 }} />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, error, isLoading, isFetching, refetch, filters, setFilters } =
    useDashboard();

  return (
    <div className="w-full min-w-0 pb-8">
      <DashboardHeader
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={() => void refetch()}
        isFetching={isFetching}
      />

      {isLoading && !data ? <DashboardSkeleton /> : null}

      {error && !data ? (
        <Alert
          type="error"
          showIcon
          message={t("dashboard.loadError")}
          description={t("dashboard.loadErrorDescription")}
          action={
            <Button size="small" onClick={() => void refetch()}>
              {t("common.reload")}
            </Button>
          }
        />
      ) : null}

      {data ? (
        <div className="space-y-5">
          <CashSummaryWidget summary={data.cash} />
          <div className="grid gap-5 xl:grid-cols-2">
            <RelationshipsWidget summary={data.relationships} />
            <TaxSummaryWidget summary={data.tax} />
          </div>
          <ReceivablesPayablesWidget
            receivables={data.receivables}
            payables={data.payables}
          />
          <ElectronicDocumentsWidget
            summary={data.electronicDocuments}
            relationships={data.relationships}
          />
          <UnavailableWidget
            title={t("dashboard.tasks.title")}
            description={t("dashboard.tasks.description")}
            status={data.tasks.sourceStatus}
          />
        </div>
      ) : null}
    </div>
  );
}
