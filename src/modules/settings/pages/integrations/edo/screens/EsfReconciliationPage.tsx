import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { edoService } from "../api";
import { saveDownloadedEdoFile } from "../utils/fileDownload";
import { useTranslation } from "react-i18next";
import { Alert, Button, DatePicker, Empty, Segmented, Table, Tabs, Tag } from "antd";
import type { TableColumnsType } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { GitCompareArrows } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/card/Card";
import { $axiosPrivate } from "@/services/AxiosService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";

type MatchStatus = "MATCHED" | "AMOUNT_DIFF" | "ONLY_IN_EDO" | "ONLY_IN_BOOKS" | "REJECTED" | "PENDING";

interface ReconciliationRow {
  status: MatchStatus;
  partnerInn: string | null;
  partnerName: string | null;
  esfNumber: string | null;
  esfProviderDocumentId: string | null;
  esfDocumentType: string | null;
  esfDate: string | null;
  esfStatus: string | null;
  esfTotal: number | null;
  esfVat: number | null;
  documentId: number | null;
  docNumber: string | null;
  docDate: string | null;
  docTotal: number | null;
  docVat: number | null;
  vatDifference: number;
}

interface ReconciliationSide {
  esfVat: number;
  booksVat: number;
  counts: Partial<Record<MatchStatus, number>>;
  rows: ReconciliationRow[];
}

interface Reconciliation {
  year: number;
  month: number;
  provider: string;
  purchases: ReconciliationSide;
  sales: ReconciliationSide;
  warnings: string[];
}

const statusColor: Record<MatchStatus, string> = {
  MATCHED: "green",
  AMOUNT_DIFF: "orange",
  ONLY_IN_EDO: "red",
  ONLY_IN_BOOKS: "volcano",
  REJECTED: "magenta",
  PENDING: "blue",
};

const money = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value);

/**
 * The month's electronic invoices at the EDO operator against our posted purchases and sales: what
 * the tax office sees through the invoices and what our books hold, row by row.
 */
export default function EsfReconciliationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // a finding of the health check opens the page on its month, side and kind of difference
  const [searchParams] = useSearchParams();
  const urlMonth = searchParams.get("month");
  const urlTab = searchParams.get("tab") === "sales" ? "sales" : "purchases";
  const urlStatus = searchParams.get("status") as MatchStatus | null;
  const initialMonth = urlMonth && dayjs(`${urlMonth}-01`).isValid()
    ? dayjs(`${urlMonth}-01`)
    : dayjs().subtract(1, "month").startOf("month");
  const [month, setMonth] = useState<Dayjs>(initialMonth);
  const [requested, setRequested] = useState<Dayjs | null>(urlMonth ? initialMonth : null);
  const [filter, setFilter] = useState<"problems" | "all" | MatchStatus>(urlStatus && statusColor[urlStatus] ? urlStatus : "problems");
  const [tab, setTab] = useState<"purchases" | "sales">(urlTab);

  const openEsf = async (row: ReconciliationRow) => {
    if (!row.esfProviderDocumentId) return;
    try {
      const file = await edoService.downloadFile({
        providerDocumentId: row.esfProviderDocumentId,
        documentType: row.esfDocumentType ?? undefined,
      });
      saveDownloadedEdoFile(file);
    } catch (cause) {
      toast.error(t("esfReconciliation.fileFailed"));
      errorHandlers(cause);
    }
  };

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["edo", "reconciliation", requested?.format("YYYY-MM")],
    queryFn: async () =>
      (
        await $axiosPrivate.get<Reconciliation>("/edo/reconciliation", {
          params: { year: requested!.year(), month: requested!.month() + 1 },
        })
      ).data,
    enabled: requested !== null,
    retry: false,
    meta: { onError: errorHandlers },
  });

  const columns: TableColumnsType<ReconciliationRow> = useMemo(
    () => [
      {
        title: t("esfReconciliation.status"),
        dataIndex: "status",
        width: 170,
        render: (status: MatchStatus) => <Tag color={statusColor[status]}>{t(`esfReconciliation.statuses.${status}`)}</Tag>,
      },
      {
        title: t("esfReconciliation.partner"),
        key: "partner",
        render: (_, row) => (
          <div>
            <div className="font-medium">{row.partnerName ?? "—"}</div>
            <div className="text-xs text-(--theme-text-secondary)">{row.partnerInn}</div>
          </div>
        ),
      },
      {
        title: t("esfReconciliation.esf"),
        key: "esf",
        render: (_, row) =>
          row.esfNumber ? (
            <div>
              <button
                type="button"
                className="text-(--theme-brand) hover:underline"
                title={t("esfReconciliation.openEsf")}
                onClick={() => void openEsf(row)}
              >
                № {row.esfNumber}
              </button>
              <div className="text-xs text-(--theme-text-secondary)">
                {row.esfDate ? dayjs(row.esfDate).format("DD.MM.YYYY") : ""} · {row.esfStatus}
              </div>
            </div>
          ) : (
            "—"
          ),
      },
      { title: t("esfReconciliation.esfVat"), dataIndex: "esfVat", align: "right", render: money },
      {
        title: t("esfReconciliation.document"),
        key: "doc",
        render: (_, row) =>
          row.docNumber ? (
            <div>
              <button
                type="button"
                className="text-(--theme-brand) hover:underline"
                title={t("esfReconciliation.openDocument")}
                onClick={() =>
                  row.documentId &&
                  navigate(tab === "sales" ? `/main/sales/sale/${row.documentId}` : `/main/purchases/purchase/${row.documentId}`)
                }
              >
                № {row.docNumber}
              </button>
              <div className="text-xs text-(--theme-text-secondary)">
                {row.docDate ? dayjs(row.docDate).format("DD.MM.YYYY") : ""}
              </div>
            </div>
          ) : (
            "—"
          ),
      },
      { title: t("esfReconciliation.docVat"), dataIndex: "docVat", align: "right", render: money },
      {
        title: t("esfReconciliation.difference"),
        dataIndex: "vatDifference",
        align: "right",
        render: (value: number) => (
          <span className={Math.abs(value) >= 1 ? "font-semibold text-rose-600" : ""}>{money(value)}</span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tab],
  );

  const side = (key: "purchases" | "sales") => {
    const part = data?.[key];
    if (!part) return null;
    const rows =
      filter === "all"
        ? part.rows
        : filter === "problems"
          ? part.rows.filter((x) => x.status !== "MATCHED")
          : part.rows.filter((x) => x.status === filter);
    const diff = part.booksVat - part.esfVat;
    return (
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <SummaryCard label={t(`esfReconciliation.${key}EsfVat`)} value={money(part.esfVat)} />
          <SummaryCard label={t(`esfReconciliation.${key}BooksVat`)} value={money(part.booksVat)} />
          <SummaryCard
            label={t("esfReconciliation.vatGap")}
            value={money(diff)}
            tone={Math.abs(diff) >= 1 ? "bad" : "good"}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(statusColor) as MatchStatus[])
            .filter((status) => part.counts[status])
            .map((status) => (
              <Tag
                key={status}
                color={statusColor[status]}
                className={`cursor-pointer ${filter === status ? "ring-2 ring-(--theme-brand)" : ""}`}
                onClick={() => setFilter(filter === status ? "problems" : status)}
              >
                {t(`esfReconciliation.statuses.${status}`)}: {part.counts[status]}
              </Tag>
            ))}
        </div>
        {filter !== "all" && filter !== "problems" && (
          <Alert
            type="warning"
            showIcon
            message={t(`esfReconciliation.statuses.${filter}`)}
            description={t(`esfReconciliation.consequences.${key}.${filter}`)}
          />
        )}
        <Card className="overflow-hidden border border-border">
          <Table<ReconciliationRow>
            rowKey={(row, index) => `${row.status}-${row.esfNumber ?? ""}-${row.documentId ?? ""}-${index}`}
            size="small"
            columns={columns}
            dataSource={rows}
            pagination={{ pageSize: 50, showSizeChanger: false }}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("esfReconciliation.noProblems")} /> }}
          />
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full space-y-3">
      <Alert type="info" showIcon message={t("esfReconciliation.hint")} />
      <div className="flex flex-wrap items-center gap-2">
        <DatePicker
          picker="month"
          format="MM.YYYY"
          allowClear={false}
          value={month}
          onChange={(value) => value && setMonth(value.startOf("month"))}
        />
        <Button
          type="primary"
          icon={<GitCompareArrows className="size-4" />}
          loading={isFetching}
          onClick={() => {
            // the same month again is compared anew, not taken from the last answer
            if (requested?.isSame(month, "month")) void refetch();
            else setRequested(month);
          }}
        >
          {t("esfReconciliation.run")}
        </Button>
        {data && (
          <Segmented
            value={filter === "all" ? "all" : "problems"}
            onChange={(value) => setFilter(value as "problems" | "all")}
            options={[
              { value: "problems", label: t("esfReconciliation.onlyProblems") },
              { value: "all", label: t("esfReconciliation.all") },
            ]}
          />
        )}
        {data?.provider && <Tag>{data.provider}</Tag>}
      </div>
      {error && <Alert type="error" showIcon message={t("esfReconciliation.failed")} />}
      {data?.warnings.map((warning) => <Alert key={warning} type="warning" showIcon message={warning} />)}
      {data && (
        <Tabs
          activeKey={tab}
          onChange={(key) => setTab(key as "purchases" | "sales")}
          items={[
            { key: "purchases", label: t("esfReconciliation.purchases"), children: side("purchases") },
            { key: "sales", label: t("esfReconciliation.sales"), children: side("sales") },
          ]}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  const color = tone === "bad" ? "text-rose-600" : tone === "good" ? "text-emerald-600" : "text-heading";
  return (
    <div className="rounded-xl border border-border bg-(--theme-bg-muted) p-4">
      <div className="text-sm text-(--theme-text-secondary)">{label}</div>
      <div className={`mt-2 text-xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
