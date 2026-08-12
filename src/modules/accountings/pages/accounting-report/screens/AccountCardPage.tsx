import type { ColumnsType } from "antd/es/table";
import { useFormik } from "formik";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpenText,
  Scale,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SelectCustom from "@/components/fields/SelectCustom";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { customDate, numberSpacing } from "@/utils/utils";
import { usePersistedState, useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import AccountingReportFilterBar from "../components/AccountingReportFilterBar";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import AccountingReportSectionCard from "../components/AccountingReportSectionCard";
import AccountingReportSummaryGrid from "../components/AccountingReportSummaryGrid";
import { useGetAccountCard } from "../hooks";
import type { AccountCardQuery, AccountCardTransaction } from "../types/type";

const initialValues: AccountCardQuery = {
  accountId: null,
  dateFrom: "",
  dateTo: "",
  page: 1,
  pageSize: 50,
};
const money = (value: number) => numberSpacing(value, undefined, true);

export default function AccountCardPage() {
  const { t } = useTranslation();
  const filtersKey = useScopedStorageKey("report-state", "account-card");
  const [filters, setFilters] = usePersistedState<AccountCardQuery>(
    filtersKey,
    {},
    { debounceMs: 0 },
  );
  const query = useGetAccountCard(filters.accountId ? filters : undefined);
  const formik = useFormik<AccountCardQuery>({
    initialValues: { ...initialValues, ...filters },
    enableReinitialize: true,
    onSubmit: (values) => setFilters(values.accountId ? values : {}),
  });

  const columns = useMemo<ColumnsType<AccountCardTransaction>>(
    () => [
      {
        title: t("app.reports.fields.postingDate"),
        dataIndex: "postingDate",
        width: 150,
        render: (value) => customDate(value),
      },
      {
        title: t("app.reports.fields.journalNumber"),
        dataIndex: "journalNumber",
        width: 150,
        render: (value) => value || "-",
      },
      {
        title: t("app.reports.fields.documentType"),
        dataIndex: "documentType",
        width: 190,
        render: (value) => value || "-",
      },
      {
        title: t("app.reports.fields.description"),
        dataIndex: "description",
        width: 240,
        render: (value) => value || "-",
      },
      {
        title: t("openingBalance.fields.debit"),
        dataIndex: "debit",
        align: "right",
        width: 150,
        render: (value) => (
          <span className="font-medium text-brand-text tabular-nums">
            {money(value)}
          </span>
        ),
      },
      {
        title: t("openingBalance.fields.credit"),
        dataIndex: "credit",
        align: "right",
        width: 150,
        render: (value) => (
          <span className="font-medium text-warning tabular-nums">
            {money(value)}
          </span>
        ),
      },
      {
        title: t("app.reports.fields.runningBalance"),
        dataIndex: "runningBalance",
        align: "right",
        width: 170,
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
        title: t("app.reports.fields.counterparty"),
        dataIndex: "counterparty",
        width: 230,
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
        refreshDisabled={!filters?.accountId}
        onDateChange={(dateFrom, dateTo) => {
          const accountId = formik.values.accountId;
          if (accountId) {
            setFilters({ accountId, dateFrom, dateTo, page: 1, pageSize: 50 });
          }
        }}
        onRefresh={() => void query.refetch()}
      >
        <div>
          <SelectCustom
            formik={formik}
            placeholder="app.reports.fields.account"
            fieldName="accountId"
            path={selectListEndpoints.chartAccountsSelectList}
            clearable
            search
            marginBottom="0"
            optionLabel={chartAccountOptionLabel}
            selectedLabel={chartAccountSelectedLabel}
            onChange={(value) => {
              const accountId = typeof value === "number" ? value : null;
              setFilters(
                accountId
                  ? {
                      accountId,
                      dateFrom: formik.values.dateFrom,
                      dateTo: formik.values.dateTo,
                      page: 1,
                      pageSize: 50,
                    }
                  : {},
              );
            }}
          />
        </div>
      </AccountingReportFilterBar>

      {data && (
        <>
          <AccountingReportSummaryGrid
            items={[
              {
                label: t("app.reports.summary.openingBalance"),
                value: money(data.openingBalance),
                icon: <BookOpenText className="size-4" />,
                tone: "primary",
              },
              {
                label: t("app.reports.summary.totalDebit"),
                value: money(data.totalDebit),
                icon: <ArrowDownRight className="size-4" />,
                tone: "primary",
              },
              {
                label: t("app.reports.summary.totalCredit"),
                value: money(data.totalCredit),
                icon: <ArrowUpRight className="size-4" />,
                tone: "warning",
              },
              {
                label: t("app.reports.summary.closingBalance"),
                value: money(data.closingBalance),
                icon: <Scale className="size-4" />,
                tone: "success",
              },
            ]}
          />

          <AccountingReportSectionCard
            title={[data.accountCode, data.accountName]
              .filter(Boolean)
              .join(" — ")}
            total={t("app.reports.card.transactionsCount", {
              count: data.totalCount,
            })}
            columns={columns}
            dataSource={data.transactions}
            loading={query.isFetching}
            emptyText={t("app.reports.card.empty")}
            tone="primary"
            rowKey="id"
            pagination={{
              current: data.page,
              pageSize: data.pageSize,
              total: data.totalCount,
              showSizeChanger: true,
              onChange: (page, pageSize) =>
                setFilters((current) =>
                  current ? { ...current, page, pageSize } : current,
                ),
            }}
          />
        </>
      )}
    </AccountingReportPageShell>
  );
}
