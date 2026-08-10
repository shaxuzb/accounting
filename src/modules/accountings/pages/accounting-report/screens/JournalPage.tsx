import type { ColumnsType } from "antd/es/table";
import { useFormik } from "formik";
import { Files, LibraryBig } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { customDate, numberSpacing } from "@/utils/utils";
import AccountingReportFilterBar from "../components/AccountingReportFilterBar";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import AccountingReportSectionCard from "../components/AccountingReportSectionCard";
import AccountingReportSummaryGrid from "../components/AccountingReportSummaryGrid";
import { useGetJournal } from "../hooks";
import type { JournalEntry, JournalQuery } from "../types/type";

const initialValues: JournalQuery = {
  dateFrom: "",
  dateTo: "",
  page: 1,
  pageSize: 50,
};
const money = (value: number) => numberSpacing(value, undefined, true);
const accountLabel = (code: string | null, name: string | null) =>
  [code, name].filter(Boolean).join(" — ") || "-";

export default function JournalPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<JournalQuery>({ page: 1, pageSize: 50 });
  const query = useGetJournal(filters);
  const formik = useFormik<JournalQuery>({
    initialValues,
    onSubmit: (values) => setFilters(values),
  });

  const columns = useMemo<ColumnsType<JournalEntry>>(
    () => [
      {
        title: t("app.reports.fields.postingDate"),
        dataIndex: "postingDate",
        width: 150,
        fixed: "left",
        render: (value) => customDate(value),
      },
      {
        title: t("app.reports.fields.journalNumber"),
        dataIndex: "journalNumber",
        width: 150,
        render: (value) => value || "-",
      },
      {
        title: t("app.reports.fields.documentNumber"),
        dataIndex: "documentNumber",
        width: 150,
        render: (value) => value || "-",
      },
      {
        title: t("app.reports.fields.documentType"),
        dataIndex: "documentType",
        width: 180,
        render: (value) => value || "-",
      },
      {
        title: t("app.reports.fields.description"),
        dataIndex: "description",
        width: 220,
        render: (value) => value || "-",
      },
      {
        title: t("app.reports.fields.debitAccount"),
        width: 260,
        render: (_value, row) =>
          accountLabel(row.debitAccountCode, row.debitAccountName),
      },
      {
        title: t("app.reports.fields.creditAccount"),
        width: 260,
        render: (_value, row) =>
          accountLabel(row.creditAccountCode, row.creditAccountName),
      },
      {
        title: t("app.reports.fields.amount"),
        dataIndex: "amount",
        align: "right",
        width: 160,
        render: (value) => (
          <span className="font-semibold tabular-nums">{money(value)}</span>
        ),
      },
      {
        title: t("app.reports.fields.currency"),
        dataIndex: "currency",
        width: 90,
        render: (value) => value || "-",
      },
      {
        title: t("app.reports.fields.organization"),
        dataIndex: "organization",
        width: 170,
        render: (value) => value || "-",
      },
      {
        title: t("app.reports.fields.counterparty"),
        dataIndex: "counterparty",
        width: 240,
        render: (value) => value || "-",
      },
    ],
    [t],
  );

  const data = query.data;

  return (
    <AccountingReportPageShell>
      <AccountingReportFilterBar
        formik={formik}
        loading={query.isFetching}
        onDateChange={(dateFrom, dateTo) =>
          setFilters((current) => ({
            ...current,
            dateFrom,
            dateTo,
            page: 1,
          }))
        }
        onRefresh={() => void query.refetch()}
      />

      {data && (
        <>
          <AccountingReportSummaryGrid
            columns={2}
            items={[
              {
                label: t("app.reports.summary.totalCount"),
                value: data.totalCount,
                icon: <Files className="size-4" />,
                tone: "primary",
              },
              {
                label: t("app.reports.summary.totalPages"),
                value: data.totalPages,
                icon: <LibraryBig className="size-4" />,
                tone: "default",
              },
            ]}
          />

          <AccountingReportSectionCard
            title={t("app.reports.journal.table")}
            total={t("app.reports.journal.entriesCount", {
              count: data.totalCount,
            })}
            columns={columns}
            dataSource={data.entries}
            loading={query.isFetching}
            emptyText={t("app.reports.journal.empty")}
            tone="primary"
            rowKey="id"
            pagination={{
              current: data.page,
              pageSize: data.pageSize,
              total: data.totalCount,
              showSizeChanger: true,
              onChange: (page, pageSize) =>
                setFilters((current) => ({ ...current, page, pageSize })),
            }}
          />
        </>
      )}
    </AccountingReportPageShell>
  );
}
