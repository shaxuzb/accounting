import { Button, DatePicker, Input, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import { RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { usePersistedState, useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import { numberSpacing } from "@/utils/utils";
import { documentRoute } from "@/shared/constants/documentRoutes";
import { getJson } from "../../services/request";

interface RegistryDocument {
  id: number;
  documentTypeId: number;
  documentTypeCode: string;
  documentTypeName: string;
  documentId: number;
  docNumber: string;
  docDate: string;
  amount: number;
  currencyCode: string | null;
  statusId: number | null;
  statusCode: string | null;
  statusName: string | null;
}

const statusColor: Record<string, string> = { posted: "green", draft: "default", cancelled: "red" };

interface State {
  dateFrom: string;
  dateTo: string;
  documentTypeId: number | null;
  search: string;
}

/** 1C «Журнал документов»: every document of the organization, of every kind, in one list by date. */
export default function DocumentJournalPage() {
  const { t } = useTranslation();
  const key = useScopedStorageKey("report-state", "document-journal");
  const [state, setState] = usePersistedState<State>(
    key,
    { dateFrom: dayjs().startOf("month").format("YYYY-MM-DD"), dateTo: dayjs().format("YYYY-MM-DD"), documentTypeId: null, search: "" },
    { debounceMs: 300 },
  );
  const query = useQuery({
    queryKey: ["document-journal", state.dateFrom, state.dateTo, state.search],
    queryFn: () =>
      getJson<RegistryDocument[]>("/documents", { dateFrom: state.dateFrom, dateTo: state.dateTo, search: state.search || undefined }),
    placeholderData: keepPreviousData,
  });

  const all = query.data ?? [];
  const types = useMemo(
    () =>
      [...new Map(all.map((x) => [x.documentTypeId, x.documentTypeName])).entries()]
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, label]) => ({ value, label })),
    [all],
  );
  const rows = state.documentTypeId ? all.filter((x) => x.documentTypeId === state.documentTypeId) : all;

  const columns: ColumnsType<RegistryDocument> = [
    { title: t("app.documentJournal.date"), width: 150, render: (_, row) => dayjs(row.docDate).format("DD.MM.YYYY HH:mm") },
    { title: t("app.documentJournal.type"), dataIndex: "documentTypeName", width: 260 },
    {
      title: t("app.documentJournal.number"),
      width: 140,
      render: (_, row) => {
        const path = documentRoute(row.documentTypeId, row.documentId);
        return path ? <Link to={path}>{row.docNumber}</Link> : row.docNumber;
      },
    },
    {
      title: t("app.documentJournal.amount"),
      width: 180,
      align: "right",
      render: (_, row) => (
        <span className="tabular-nums">
          {row.amount ? numberSpacing(row.amount, undefined, true) : "—"} {row.currencyCode ?? ""}
        </span>
      ),
    },
    {
      title: t("app.documentJournal.status"),
      width: 140,
      render: (_, row) => (row.statusName ? <Tag color={statusColor[row.statusCode ?? ""] ?? "blue"}>{row.statusName}</Tag> : "—"),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <DatePicker.RangePicker
          allowClear={false}
          format="DD.MM.YYYY"
          value={[dayjs(state.dateFrom), dayjs(state.dateTo)]}
          onChange={(range) => {
            const [from, to] = (range ?? []) as [Dayjs | null, Dayjs | null];
            if (from && to) setState({ ...state, dateFrom: from.format("YYYY-MM-DD"), dateTo: to.format("YYYY-MM-DD") });
          }}
        />
        <Select
          className="w-64"
          allowClear
          placeholder={t("app.documentJournal.allTypes")}
          value={state.documentTypeId ?? undefined}
          options={types}
          onChange={(documentTypeId?: number) => setState({ ...state, documentTypeId: documentTypeId ?? null })}
        />
        <Input.Search
          style={{ width: 240 }}
          allowClear
          placeholder={t("app.documentJournal.searchNumber")}
          defaultValue={state.search}
          onSearch={(search) => setState({ ...state, search })}
        />
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-secondary-text">{t("app.documentJournal.count", { count: rows.length })}</span>
          <Button icon={<RefreshCw className="size-4" />} loading={query.isFetching} onClick={() => void query.refetch()} />
        </div>
      </div>
      <Table<RegistryDocument>
        size="small"
        bordered
        rowKey="id"
        loading={query.isFetching}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 100, showSizeChanger: false }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
}
